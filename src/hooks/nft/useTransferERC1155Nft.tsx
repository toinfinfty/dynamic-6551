import { useState } from "react";
import { useWalletClient } from "wagmi";
import { Address } from "viem";
import { ERC1155ABI } from "../../utils/ERC1155ABI";
import debug from "debug";

const log = debug("dynamic-6551:useTransferERC1155Nft");

export interface TransferERC1155NftParams {
  contractAddress: Address;
  fromAddress: Address;
  toAddress: Address;
  tokenId: string;
  amount: number;
}

/**
 * Custom hook to transfer ERC-1155 NFTs.
 *
 * @returns {Object} An object containing the transfer function, loading state, and error state.
 * @property {Function} transferERC1155Nft - Function to transfer ERC-1155 NFTs.
 * @property {boolean} loading - Indicates if the transfer operation is in progress.
 * @property {string | null} error - Error message if the transfer operation fails.
 *
 * @typedef {Object} TransferERC1155NftParams
 * @property {string} contractAddress - The address of the ERC-1155 contract.
 * @property {string} fromAddress - The address of the sender.
 * @property {string} toAddress - The address of the recipient.
 * @property {number} tokenId - The ID of the token to transfer.
 * @property {number} amount - The amount of tokens to transfer.
 */
export const useTransferERC1155Nft = () => {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transferERC1155Nft = async (params: TransferERC1155NftParams) => {
    if (!walletClient) {
      const errorMsg = "No wallet client connected";
      log(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(true);
    setError(null);
    log(
      `Attempting to transfer ${params.amount} of tokenId ${params.tokenId} from ${params.fromAddress} to ${params.toAddress} at contract address: ${params.contractAddress}`
    );

    try {
      const tx = await walletClient.writeContract({
        address: params.contractAddress,
        abi: ERC1155ABI,
        functionName: "safeTransferFrom",
        args: [
          params.fromAddress,
          params.toAddress,
          params.tokenId,
          params.amount,
          "0x0",
        ],
      });
      log(`Transfer transaction sent successfully`);
      return tx;
    } catch (err) {
      log("Error transferring ERC-1155 NFT:", err);
      console.error("Error transferring NFT:", err);
      setError("Failed to transfer NFT");
      throw err;
    } finally {
      setLoading(false);
      log(
        `Transfer operation completed for tokenId ${params.tokenId} at contract address: ${params.contractAddress}`
      );
    }
  };

  return { transferERC1155Nft, loading, error };
};
