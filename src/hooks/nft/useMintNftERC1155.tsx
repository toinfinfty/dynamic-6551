// src/hooks/useMintNft.ts
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { ERC1155ABI } from "../../utils/ERC1155ABI";

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
      throw new Error("No wallet client connected");
    }
    setLoading(true);
    setError(null);
    const account = walletClient.account;
    try {
      const tx = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: ERC1155ABI,
        functionName: "mint",
        args: [account.address, tokenId, quantity, "0x"],
      });
      return tx;
    } catch (err) {
      console.error("Error minting NFT:", err);
      setError("Failed to mint NFT");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mintNftERC1155, loading, error };
};
