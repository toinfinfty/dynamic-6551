import { useState } from "react";
import { useTokenbound } from "../useTokenbound";
import { Address } from "viem";
import debug from "debug";

const log = debug("dynamic-6551:useTokenboundTransfer");

export type PossibleENSAddress = Address | `${string}.eth`;

export enum TokenType {
  ERC721 = "ERC721",
  ERC1155 = "ERC1155", 
}

export interface TransferNftParams {
  account: Address;
  tokenContract: Address;
  tokenId: string;
  tokenType: TokenType;
  recipientAddress: PossibleENSAddress;
  amount?: number;
  chainId?: number;
}

export interface TransferERC20Params {
  account: Address;
  amount: number;
  recipientAddress: PossibleENSAddress;
  erc20tokenAddress: Address;
  erc20tokenDecimals: number;
  chainId?: number;
}

export const useTokenboundTransfer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { tokenboundClient } = useTokenbound();

  const transferNft = async (params: TransferNftParams) => {
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

  const transferERC20 = async (params: TransferERC20Params) => {
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
