import { useState } from "react";
import { useWalletClient } from "wagmi";
import { Address } from "viem";
import { ERC20ABI } from "../../utils/ERC20ABI";
import debug from "debug";

const log = debug("dynamic-6551:useBurnERC20");

/**
 * Custom hook to burn ERC20 tokens.
 *
 * @returns {Object} An object containing the `burnERC20` function, `loading` state, and `error` state.
 *
 * @typedef {Object} BurnERC20Hook
 * @property {Function} burnERC20 - Function to burn ERC20 tokens.
 * @property {boolean} loading - Indicates if the burn operation is in progress.
 * @property {string | null} error - Error message if the burn operation fails.
 *
 * @function burnERC20
 * @param {Address} contractAddress - The address of the ERC20 contract.
 * @param {number} amount - The amount of tokens to burn.
 * @returns {Promise<any>} The transaction object if the burn operation is successful.
 * @throws Will throw an error if the wallet client is not connected or if the burn operation fails.
 */
export const useBurnERC20 = () => {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const burnERC20 = async (contractAddress: Address, amount: number) => {
    if (!walletClient) {
      const errorMsg = "No wallet client connected";
      log(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(true);
    setError(null);
    log(`Attempting to burn ${amount} tokens from contract at address: ${contractAddress}`);

    try {
      const tx = await walletClient.writeContract({
        address: contractAddress,
        abi: ERC20ABI,
        functionName: "burn",
        args: [amount],
      });
      log(`Burn transaction sent successfully`);
      return tx;
    } catch (err) {
      log("Error burning ERC20 token:", err);
      console.error("Error burning ERC20:", err);
      setError("Failed to burn ERC20");
      throw err;
    } finally {
      setLoading(false);
      log(`Burn operation completed for contract address: ${contractAddress}`);
    }
  };

  return { burnERC20, loading, error };
};
