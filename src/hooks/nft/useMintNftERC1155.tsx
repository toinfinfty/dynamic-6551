import { useState } from "react";
import { useWalletClient } from "wagmi";
import { ERC1155ABI } from "../../utils/ERC1155ABI";
import debug from "debug";

const log = debug("dynamic-6551:useMintNftERC1155");

/**
 * Custom hook to mint ERC-1155 NFTs.
 *
 * @returns {Object} - An object containing the mintNftERC1155 function, loading state, and error state.
 * 
 * @property {Function} mintNftERC1155 - Function to mint ERC-1155 NFTs.
 * @property {boolean} loading - Boolean indicating if the minting process is in progress.
 * @property {string | null} error - Error message if the minting process fails, otherwise null.
 * 
 * @function mintNftERC1155
 * @async
 * @param {string} contractAddress - The address of the ERC-1155 contract.
 * @param {number} tokenId - The ID of the token to mint.
 * @param {number} quantity - The quantity of tokens to mint.
 * @throws {Error} Throws an error if no wallet client is connected or if the minting process fails.
 * @returns {Promise<any>} - The transaction object of the mint operation.
 */
export const useMintNftERC1155 = () => {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mintNftERC1155 = async (
    contractAddress: string,
    tokenId: number,
    quantity: number
  ) => {
    if (!walletClient) {
      const errorMsg = "No wallet client connected";
      log(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(true);
    setError(null);
    const account = walletClient.account;
    log(
      `Attempting to mint ${quantity} of ERC-1155 tokenId ${tokenId} at contract address: ${contractAddress} to account: ${account?.address}`
    );

    try {
      const tx = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: ERC1155ABI,
        functionName: "mint",
        args: [account.address, tokenId, quantity, "0x"],
      });
      log(`Mint transaction sent successfully`);
      return tx;
    } catch (err) {
      log("Error minting ERC-1155 NFT:", err);
      console.error("Error minting ERC-1155 NFT:", err);
      setError("Failed to mint NFT");
      throw err;
    } finally {
      setLoading(false);
      log(
        `Mint operation completed for tokenId ${tokenId} at contract address: ${contractAddress}`
      );
    }
  };

  return { mintNftERC1155, loading, error };
};
