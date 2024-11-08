// src/hooks/useFetchNftsForWallet.ts
import { useState } from "react";
import { alchemyClient } from "../../utils/alchemyClient";
import { getNetworkConfig } from "../../utils/networkConfig";
import { useTokenbound } from "../useTokenbound";
import { OwnedNft } from "alchemy-sdk";
import { Address } from "viem";

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
  /** The contract address of the token. */
  contractAddress: string;
  /**
   * The raw value of the balance field as a hex string. This value is undefined
   * if the {@link error} field is present.
   */
  rawBalance?: string;
  /**
   * The formatted value of the balance field as a hex string. This value is
   * undefined if the {@link error} field is present, or if the `decimals` field=
   * is undefined.
   */
  balance?: string;
  /** */
  /**
   * The token's name. Is undefined if the name is not defined in the contract and
   * not available from other sources.
   */
  name?: string;
  /**
   * The token's symbol. Is undefined if the symbol is not defined in the contract
   * and not available from other sources.
   */
  symbol?: string;
  /**
   * The number of decimals of the token. Is undefined if not defined in the
   * contract and not available from other sources.
   */
  decimals?: number;
  /** URL link to the token's logo. Is undefined if the logo is not available. */
  logo?: string;
  /**
   * Error from fetching the token balances. If this field is defined, none of
   * the other fields will be defined.
   */
  error?: string;
}

export interface GetTokensForOwnerResponse {
  /** Owned tokens for the provided addresses along with relevant metadata. */
  tokens: OwnedToken[];
  /** Page key for the next page of results, if one exists. */
  pageKey?: string;
}

export const useAccountHoldings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { tokenboundClient } = useTokenbound();

  const fetchNftsForAccount = async (
    accountAddress: Address,
    chainId: number,
    visitedAccounts: Set<Address>
  ): Promise<NFTWithTokenboundAccount[]> => {
    if (visitedAccounts.has(accountAddress)) return [];
    visitedAccounts.add(accountAddress);

    try {
      const nftsResponse = await alchemyClient.nft.getNftsForOwner(
        accountAddress
      );
      const nfts: NFTWithTokenboundAccount[] = [];

      for (const nft of nftsResponse.ownedNfts) {
        let tbAccountAddress: Address | undefined;
        try {
          tbAccountAddress = await tokenboundClient?.getAccount({
            tokenContract: nft.contract.address as Address,
            tokenId: nft.tokenId,
            chainId,
          });

          if (tbAccountAddress) {
            const isDeployed = await tokenboundClient?.checkAccountDeployment({
              accountAddress: tbAccountAddress,
            });
            if (!isDeployed) tbAccountAddress = undefined;
          }
        } catch (err) {
          console.error("Error fetching token bound account:", err);
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
      console.error("Error fetching NFTs for account:", err);
      throw err;
    } finally {
      visitedAccounts.delete(accountAddress);
    }
  };

  const fetchERC20TokensForAccount = async (
    accountAddress: Address
  ): Promise<OwnedToken[]> => {
    try {
      const tokensResponse = await alchemyClient.core.getTokensForOwner(
        accountAddress
      );
      return tokensResponse.tokens;
    } catch (err) {
      console.error("Error fetching ERC20 tokens for account:", err);
      return [];
    }
  };

  const getAccountHoldings = async (walletAddress: Address) => {
    setLoading(true);
    setError(null);
    try {
      const chainId = getNetworkConfig().id;
      const visitedAccounts = new Set<Address>();
      const nfts = await fetchNftsForAccount(
        walletAddress,
        chainId,
        visitedAccounts
      );
      const tokens = await alchemyClient.core.getTokensForOwner(walletAddress);

      return { nfts, tokens };
    } catch (err) {
      console.error("Error fetching NFTs:", err);
      setError("Failed to fetch NFTs");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getAccountHoldings, loading, error };
};
