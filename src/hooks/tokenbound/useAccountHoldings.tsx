import { useState } from "react";
// import { alchemyClient } from "../../utils/alchemyClient";
import { getNetworkConfig } from "../../utils/networkConfig";
import { useTokenbound } from "../useTokenbound";
import { OwnedNft } from "alchemy-sdk";
import { Address } from "viem";
import debug from "debug";
import { useConfig } from "../../contexts/ConfigProvider";

const log = debug("myLibrary:useAccountHoldings");

interface TokenboundAccount {
  address: Address;
  nfts: NFTWithTokenboundAccount[];
  tokens: OwnedToken[];
}

export interface NFTWithTokenboundAccount extends OwnedNft {
  owner: Address;
  tokenboundAccount?: TokenboundAccount;
}

export interface OwnedToken {
  contractAddress: string;
  rawBalance?: string;
  balance?: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  logo?: string;
  error?: string;
}

export interface GetTokensForOwnerResponse {
  tokens: OwnedToken[];
  pageKey?: string;
}

export const useAccountHoldings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { tokenboundClient } = useTokenbound();
  const { alchemyClient } = useConfig();

  const fetchNftsForAccount = async (
    accountAddress: Address,
    chainId: number,
    visitedAccounts: Set<Address>
  ): Promise<NFTWithTokenboundAccount[]> => {
    if (visitedAccounts.has(accountAddress)) {
      log(`Skipping already visited account: ${accountAddress}`);
      return [];
    }
    log(`Fetching NFTs for account: ${accountAddress} on chain: ${chainId}`);
    visitedAccounts.add(accountAddress);

    try {
      const nftsResponse = await alchemyClient.nft.getNftsForOwner(
        accountAddress
      );
      log(
        `Fetched ${nftsResponse.ownedNfts.length} NFTs for account ${accountAddress}`
      );
      const nfts: NFTWithTokenboundAccount[] = [];

      for (const nft of nftsResponse.ownedNfts) {
        let tbAccountAddress: Address | undefined;
        try {
          log(
            `Fetching tokenbound account for NFT contract: ${nft.contract.address}, tokenId: ${nft.tokenId}`
          );
          tbAccountAddress = await tokenboundClient?.getAccount({
            tokenContract: nft.contract.address as Address,
            tokenId: nft.tokenId,
            chainId,
          });

          if (tbAccountAddress) {
            const isDeployed = await tokenboundClient?.checkAccountDeployment({
              accountAddress: tbAccountAddress,
            });
            log(
              `Tokenbound account ${tbAccountAddress} deployment status: ${isDeployed}`
            );
            if (!isDeployed) tbAccountAddress = undefined;
          }
        } catch (err) {
          log("Error fetching tokenbound account:", err);
          console.error("Error fetching tokenbound account:", err);
        }

        let childNfts: NFTWithTokenboundAccount[] = [];
        let childERC20Tokens: OwnedToken[] = [];

        if (tbAccountAddress) {
          childNfts = await fetchNftsForAccount(
            tbAccountAddress,
            chainId,
            visitedAccounts
          );
          childERC20Tokens = await fetchERC20TokensForAccount(tbAccountAddress);
          log(
            `Fetched ${childNfts.length} child NFTs and ${childERC20Tokens.length} child ERC-20 tokens for tokenbound account: ${tbAccountAddress}`
          );
        }

        nfts.push({
          ...nft,
          owner: accountAddress,
          tokenboundAccount: tbAccountAddress
            ? {
                address: tbAccountAddress,
                nfts: childNfts,
                tokens: childERC20Tokens,
              }
            : undefined,
        });
      }

      return nfts;
    } catch (err) {
      log("Error fetching NFTs for account:", err);
      console.error("Error fetching NFTs for account:", err);
      throw err;
    } finally {
      visitedAccounts.delete(accountAddress);
    }
  };

  const fetchERC20TokensForAccount = async (
    accountAddress: Address
  ): Promise<OwnedToken[]> => {
    log(`Fetching ERC-20 tokens for account: ${accountAddress}`);
    try {
      const tokensResponse = await alchemyClient.core.getTokensForOwner(
        accountAddress
      );
      log(
        `Fetched ${tokensResponse.tokens.length} ERC-20 tokens for account: ${accountAddress}`
      );
      return tokensResponse.tokens;
    } catch (err) {
      log("Error fetching ERC-20 tokens for account:", err);
      console.error("Error fetching ERC-20 tokens for account:", err);
      return [];
    }
  };

  const getAccountHoldings = async (walletAddress: Address) => {
    setLoading(true);
    setError(null);
    log(`Fetching account holdings for wallet: ${walletAddress}`);
    try {
      const chainId = getNetworkConfig().id;
      log(`Using chain ID: ${chainId}`);
      const visitedAccounts = new Set<Address>();
      const nfts = await fetchNftsForAccount(
        walletAddress,
        chainId,
        visitedAccounts
      );
      log(`Total NFTs fetched for wallet ${walletAddress}: ${nfts.length}`);

      const tokens = await alchemyClient.core.getTokensForOwner(walletAddress);
      log(
        `Fetched ${tokens.tokens.length} ERC-20 tokens for wallet: ${walletAddress}`
      );

      return { nfts, tokens };
    } catch (err) {
      log("Error fetching account holdings:", err);
      console.error("Error fetching account holdings:", err);
      setError("Failed to fetch NFTs");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getAccountHoldings, loading, error };
};
