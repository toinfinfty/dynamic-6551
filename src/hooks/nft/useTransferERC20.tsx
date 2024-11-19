import { useState } from "react";
import { useWalletClient } from "wagmi";
import { Address } from "viem";
import { ERC20ABI } from "../../utils/ERC20ABI";
import debug from "debug";

const log = debug("dynamic-6551:useTransferERC20");

export interface TransferERC20NftParams {
  contractAddress: Address;
  toAddress: Address;
  amount: number;
}

/**
 * Custom hook to transfer ERC20 tokens using a connected wallet client.
 *
 * @returns {Object} An object containing the transferERC20 function, loading state, and error state.
 *
 * @typedef {Object} TransferERC20NftParams
 * @property {string} contractAddress - The address of the ERC20 contract.
 * @property {string} toAddress - The address to transfer tokens to.
 * @property {string | number | bigint} amount - The amount of tokens to transfer.
 *
 * @function transferERC20
 * @async
 * @param {TransferERC20NftParams} params - The parameters for the transfer operation.
 * @throws Will throw an error if no wallet client is connected or if the transfer fails.
 * @returns {Promise<any>} The transaction object if the transfer is successful.
 *
 * @property {boolean} loading - Indicates if the transfer operation is in progress.
 * @property {string | null} error - Contains the error message if the transfer fails.
 */
export const useTransferERC20 = () => {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transferERC20 = async (params: TransferERC20NftParams) => {
    if (!walletClient) {
      const errorMsg = "No wallet client connected";
      log(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(true);
    setError(null);
    log(
      `Attempting to transfer ${params.amount} tokens from contract ${params.contractAddress} to ${params.toAddress}`
    );

    try {
      const tx = await walletClient.writeContract({
        address: params.contractAddress,
        abi: ERC20ABI,
        functionName: "transfer",
        args: [params.toAddress, params.amount],
      });
      log(`Transfer transaction sent successfully`);
      return tx;
    } catch (err) {
      log("Error transferring ERC20:", err);
      console.error("Error transferring ERC20:", err);
      setError("Failed to transfer ERC20");
      throw err;
    } finally {
      setLoading(false);
      log(
        `Transfer operation completed for contract address: ${params.contractAddress}`
      );
    }
  };

  return { transferERC20, loading, error };
};
