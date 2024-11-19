import { useState } from "react";
import { useWalletClient } from "wagmi";
import { Address } from "viem";
import { ERC1155ABI } from "../../utils/ERC1155ABI";
import debug from "debug";

const log = debug("dynamic-6551:useBurnNftERC1155");

/**
 * Custom hook to burn ERC-1155 NFTs.
 * @returns {Object} - An object containing the burn function, loading state, and error state.
 */
export const useBurnNftERC1155 = () => {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Function to burn ERC-1155 NFTs.
   * @param {Address} contractAddress - The address of the ERC-1155 contract.
   * @param {number} tokenId - The ID of the token to burn.
   * @param {number} quantity - The quantity of tokens to burn.
   * @returns {Promise<any>} - The transaction result.
   * @throws {Error} - Throws an error if the wallet client is not connected or if the burn operation fails.
   */
  const burnNftERC1155 = async (
    contractAddress: Address,
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
      `Attempting to burn ${quantity} of ERC-1155 tokenId ${tokenId} at contract address: ${contractAddress} for account: ${account?.address}`
    );

    try {
      const tx = await walletClient.writeContract({
        address: contractAddress,
        abi: ERC1155ABI,
        functionName: "burn",
        args: [account.address, tokenId, quantity],
      });
      log(`Burn transaction sent successfully`);
      return tx;
    } catch (err) {
      log("Error burning ERC-1155 NFT:", err);
      console.error("Error burning ERC-1155 NFT:", err);
      setError("Failed to burn NFT");
      throw err;
    } finally {
      setLoading(false);
      log(
        `Burn operation completed for tokenId ${tokenId} at contract address: ${contractAddress}`
      );
    }
  };

  return { burnNftERC1155, loading, error };
};
