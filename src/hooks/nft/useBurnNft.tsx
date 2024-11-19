import { useState } from "react";
import { useWalletClient } from "wagmi";
import { Address } from "viem";
import { ERC721ABI } from "../../utils/ERC721ABI";
import debug from "debug";

const log = debug("dynamic-6551:useBurnNft");

/**
 * Custom hook to burn an NFT.
 *
 * @returns {Object} An object containing the burnNft function, loading state, and error state.
 *
 * @typedef {Object} BurnNftReturn
 * @property {Function} burnNft - Function to burn an NFT.
 * @property {boolean} loading - Indicates if the burn operation is in progress.
 * @property {string | null} error - Error message if the burn operation fails.
 *
 * @function burnNft
 * @param {Address} contractAddress - The address of the NFT contract.
 * @param {number} tokenId - The ID of the token to be burned.
 * @returns {Promise<any>} A promise that resolves to the transaction object if the burn operation is successful.
 *
 * @throws {Error} Throws an error if no wallet client is connected or if the burn operation fails.
 */
export const useBurnNft = () => {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const burnNft = async (contractAddress: Address, tokenId: number) => {
    if (!walletClient) {
      const errorMsg = "No wallet client connected";
      log(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(true);
    setError(null);
    log(`Attempting to burn NFT with tokenId ${tokenId} at contract address: ${contractAddress}`);

    try {
      const tx = await walletClient.writeContract({
        address: contractAddress,
        abi: ERC721ABI,
        functionName: "burn",
        args: [tokenId],
      });
      log(`Burn transaction sent successfully`);
      return tx;
    } catch (err) {
      log("Error burning NFT:", err);
      console.error("Error burning NFT:", err);
      setError("Failed to burn NFT");
      throw err;
    } finally {
      setLoading(false);
      log(`Burn operation completed for tokenId ${tokenId} at contract address: ${contractAddress}`);
    }
  };

  return { burnNft, loading, error };
};
