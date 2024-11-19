import { useState } from "react";
import { useTokenbound } from "../useTokenbound";
import { Address } from "viem";
import debug from "debug";

/** Debug logger for the useTokenboundTransfer hook */
const log = debug("dynamic-6551:useTokenboundTransfer");

/**
 * Type representing a possible ENS address, which can be a standard address or an ENS domain.
 */
export type PossibleENSAddress = Address | `${string}.eth`;

/**
 * Enum representing the token types supported for transfer.
 */
export enum TokenType {
  ERC721 = "ERC721",
  ERC1155 = "ERC1155",
}

/**
 * Interface for the parameters required to transfer an NFT.
 *
 * @typedef {Object} TransferNftParams
 * @property {Address} account - The tokenbound account address from which to transfer the NFT.
 * @property {Address} tokenContract - The contract address of the NFT.
 * @property {string} tokenId - The token ID of the NFT to transfer.
 * @property {TokenType} tokenType - The type of the token (ERC721 or ERC1155).
 * @property {PossibleENSAddress} recipientAddress - The recipient's address or ENS domain.
 * @property {number} [amount] - The amount to transfer (required for ERC1155 tokens).
 * @property {number} [chainId] - The chain ID for the transaction (optional).
 */
export interface TransferNftParams {
  account: Address;
  tokenContract: Address;
  tokenId: string;
  tokenType: TokenType;
  recipientAddress: PossibleENSAddress;
  amount?: number;
  chainId?: number;
}

/**
 * Interface for the parameters required to transfer ERC20 tokens.
 *
 * @typedef {Object} TransferERC20Params
 * @property {Address} account - The tokenbound account address from which to transfer the tokens.
 * @property {number} amount - The amount of tokens to transfer.
 * @property {PossibleENSAddress} recipientAddress - The recipient's address or ENS domain.
 * @property {Address} erc20tokenAddress - The contract address of the ERC20 token.
 * @property {number} erc20tokenDecimals - The number of decimals the ERC20 token uses.
 * @property {number} [chainId] - The chain ID for the transaction (optional).
 */
export interface TransferERC20Params {
  account: Address;
  amount: number;
  recipientAddress: PossibleENSAddress;
  erc20tokenAddress: Address;
  erc20tokenDecimals: number;
  chainId?: number;
}

/**
 * Custom React hook to handle transferring NFTs and ERC20 tokens using the Tokenbound client.
 *
 * @returns {Object} An object containing:
 * - `transferNft`: Function to transfer an NFT.
 * - `transferERC20`: Function to transfer ERC20 tokens.
 * - `loading`: Boolean indicating if a transfer operation is in progress.
 * - `error`: Error message if a transfer operation fails.
 */
export const useTokenboundTransfer = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { tokenboundClient } = useTokenbound();

  /**
   * Function to transfer an NFT from a tokenbound account to a recipient.
   *
   * @param {TransferNftParams} params - The parameters required for transferring the NFT.
   * @throws Will throw an error if the Tokenbound client is not initialized or if the transfer fails.
   */
  const transferNft = async (params: TransferNftParams): Promise<void> => {
    if (!tokenboundClient) {
      const errorMsg = "TokenboundClient not initialized";
      log(errorMsg);
      throw new Error(errorMsg);
    }
    setLoading(true);
    setError(null);
    log("Initiating NFT transfer with parameters:", params);

    try {
      const isValidSigner = await tokenboundClient.isValidSigner({
        account: params.account,
      });
      log(`Signer validation for account ${params.account}: ${isValidSigner}`);

      if (!isValidSigner) {
        const signerError = "Invalid signer for tokenbound account";
        log(signerError);
        throw new Error(signerError);
      }

      await tokenboundClient.transferNFT(params);
      log(
        `NFT transfer successful for tokenId ${params.tokenId} to ${params.recipientAddress}`
      );
    } catch (err) {
      log("Error transferring NFT:", err);
      console.error("Error transferring NFT:", err);
      setError("Failed to transfer NFT");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Function to transfer ERC20 tokens from a tokenbound account to a recipient.
   *
   * @param {TransferERC20Params} params - The parameters required for transferring the ERC20 tokens.
   * @throws Will throw an error if the Tokenbound client is not initialized or if the transfer fails.
   */
  const transferERC20 = async (params: TransferERC20Params): Promise<void> => {
    if (!tokenboundClient) {
      const errorMsg = "TokenboundClient not initialized";
      log(errorMsg);
      throw new Error(errorMsg);
    }
    setLoading(true);
    setError(null);
    log("Initiating ERC-20 transfer with parameters:", params);

    try {
      const isValidSigner = await tokenboundClient.isValidSigner({
        account: params.account,
      });
      log(`Signer validation for account ${params.account}: ${isValidSigner}`);

      if (!isValidSigner) {
        const signerError = "Invalid signer for tokenbound account";
        log(signerError);
        throw new Error(signerError);
      }

      await tokenboundClient.transferERC20(params);
      log(
        `ERC-20 transfer successful for ${params.amount} tokens to ${params.recipientAddress}`
      );
    } catch (err) {
      log("Error transferring ERC-20 token:", err);
      console.error("Error transferring ERC-20 token:", err);
      setError("Failed to transfer tokenbound ERC20");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { transferNft, transferERC20, loading, error };
};
