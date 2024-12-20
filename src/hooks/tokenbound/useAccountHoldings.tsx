import { useState } from "react";
// import { alchemyClient } from "../../utils/alchemyClient";
import { getNetworkConfig } from "../../utils/networkConfig";
import { useTokenbound } from "../useTokenbound";
import { OwnedNft } from "alchemy-sdk";
import { Address } from "viem";
import debug from "debug";
import { useConfig } from "../../contexts/ConfigProvider";

const log = debug("dynamic-6551:useAccountHoldings");

/**
 * Interface representing a Tokenbound Account.
 *
 * @typedef {Object} TokenboundAccount
 * @property {Address} address - The address of the tokenbound account.
 * @property {NFTWithTokenboundAccount[]} nfts - NFTs owned by the tokenbound account.
 * @property {OwnedToken[]} tokens - ERC-20 tokens owned by the tokenbound account.
 */
interface TokenboundAccount {
  address: Address;
  nfts: NFTWithTokenboundAccount[];
  tokens: OwnedToken[];
}

/**
 * Interface extending OwnedNft to include owner and optional tokenbound account.
 *
 * @typedef {Object} NFTWithTokenboundAccount
 * @extends OwnedNft
 * @property {Address} owner - The owner address of the NFT.
 * @property {TokenboundAccount} [tokenboundAccount] - The associated tokenbound account.
 */
export interface NFTWithTokenboundAccount extends OwnedNft {
  owner: Address;
  tokenboundAccount?: TokenboundAccount;
}

/**
 * Interface representing an Owned ERC-20 Token.
 *
 * @typedef {Object} OwnedToken
 * @property {string} contractAddress - The contract address of the token.
 * @property {string} [rawBalance] - The raw balance of the token.
 * @property {string} [balance] - The formatted balance of the token.
 * @property {string} [name] - The name of the token.
 * @property {string} [symbol] - The symbol of the token.
 * @property {number} [decimals] - The number of decimals of the token.
 * @property {string} [logo] - The logo URL of the token.
 * @property {string} [error] - Any error related to fetching the token.
 */
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

/**
 * Interface for the response from getting tokens for an owner.
 *
 * @typedef {Object} GetTokensForOwnerResponse
 * @property {OwnedToken[]} tokens - The list of owned tokens.
 * @property {string} [pageKey] - The pagination key for fetching more tokens.
 */
export interface GetTokensForOwnerResponse {
  tokens: OwnedToken[];
  pageKey?: string;
}

/**
 * Custom hook to fetch account holdings, including NFTs and ERC-20 tokens, using Alchemy and Tokenbound clients.
 *
 * @returns {Object} An object containing the `getAccountHoldings` function, `loading` state, and `error` state.
 *
 * @typedef {Object} AccountHoldingsReturn
 * @property {Function} getAccountHoldings - Function to fetch account holdings.
 * @property {boolean} loading - Indicates if the fetching process is in progress.
 * @property {string | null} error - Error message if the fetching process fails.
 *
 * @function getAccountHoldings
 * @async
 * @param {Address} walletAddress - The wallet address to fetch holdings for.
 * @throws Will throw an error if fetching fails.
 * @returns {Promise<{ nfts: NFTWithTokenboundAccount[]; tokens: GetTokensForOwnerResponse }>} The account holdings.
 */
export const useAccountHoldings = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { tokenboundClient } = useTokenbound();
  const { alchemyClient } = useConfig();

  /**
   * Recursive function to fetch NFTs for a given account, including any tokenbound accounts.
   *
   * @param {Address} accountAddress - The address of the account to fetch NFTs for.
   * @param {number} chainId - The chain ID to use for fetching.
   * @param {Set<Address>} visitedAccounts - A set of visited accounts to prevent infinite loops.
   * @returns {Promise<NFTWithTokenboundAccount[]>} A promise that resolves to an array of NFTs with tokenbound accounts.
   */
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

  /**
   * Function to fetch ERC-20 tokens for a given account.
   *
   * @param {Address} accountAddress - The address of the account to fetch ERC-20 tokens for.
   * @returns {Promise<OwnedToken[]>} A promise that resolves to an array of owned ERC-20 tokens.
   */
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

  /**
   * Function to get account holdings, including NFTs and ERC-20 tokens.
   *
   * @param {Address} walletAddress - The wallet address to fetch holdings for.
   * @throws Will throw an error if fetching fails.
   * @returns {Promise<{ nfts: NFTWithTokenboundAccount[]; tokens: GetTokensForOwnerResponse }>} The account holdings.
   */
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
