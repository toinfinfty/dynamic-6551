// src/hooks/useTokenboundTransfer.ts
import { useState } from "react";
import { useTokenbound } from "../useTokenbound";
import { Address } from "viem";

export type PossibleENSAddress = Address | `${string}.eth`;

export interface TransferNftParams {
  account: Address;
  tokenContract: Address;
  tokenId: string;
  tokenType: "ERC721" | "ERC1155";
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
      throw new Error("TokenboundClient not initialized");
    }
    setLoading(true);
    setError(null);
    try {
      const isValidSigner = await tokenboundClient.isValidSigner({
        account: params.account,
      });

      if (!isValidSigner) {
        throw new Error("Invalid signer for tokenbound account");
      }

      await tokenboundClient.transferNFT(params);
    } catch (err) {
      console.error("Error transferring NFT:", err);
      setError("Failed to transfer NFT");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const transferERC20 = async (params: TransferERC20Params) => {
    if (!tokenboundClient) {
      throw new Error("TokenboundClient not initialized");
    }
    setLoading(true);
    setError(null);
    try {
      const isValidSigner = await tokenboundClient.isValidSigner({
        account: params.account,
      });

      if (!isValidSigner) {
        throw new Error("Invalid signer for tokenbound account");
      }

      await tokenboundClient.transferERC20(params);
    } catch (err) {
      console.error("Error transferring tokenbound ERC20:", err);
      setError("Failed to transfer tokenbound ERC20");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { transferNft, transferERC20, loading, error };
};
