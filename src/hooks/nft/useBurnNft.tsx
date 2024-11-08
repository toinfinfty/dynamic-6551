// src/hooks/useBurnNft.ts
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { Address } from "viem";
import { ERC721ABI } from "../../utils/ERC721ABI";

export const useBurnNft = () => {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const burnNft = async (contractAddress: Address, tokenId: number) => {
    if (!walletClient) {
      throw new Error("No wallet client connected");
    }
    setLoading(true);
    setError(null);
    try {
      const tx = await walletClient.writeContract({
        address: contractAddress,
        abi: ERC721ABI,
        functionName: "burn",
        args: [tokenId],
      });
      return tx;
    } catch (err) {
      console.error("Error burning NFT:", err);
      setError("Failed to burn NFT");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { burnNft, loading, error };
};
