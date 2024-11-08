import { useState } from "react";
import { useWalletClient } from "wagmi";
import { Address } from "viem";
import { ERC1155ABI } from "../../utils/ERC1155ABI";
import debug from "debug";

const log = debug("myLibrary:useBurnNftERC1155");

export const useBurnNftERC1155 = () => {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Execute the burn transaction
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
