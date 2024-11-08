// src/hooks/useMintNft.ts
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { ERC721ABI } from "../../utils/ERC721ABI";
import { Address } from "viem";

export const useMintNft = () => {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mintNft = async (contractAddress: string, to: Address) => {
    if (!walletClient) {
      throw new Error("No wallet client connected");
    }
    setLoading(true);
    setError(null);
    try {
      const tx = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: ERC721ABI,
        functionName: "safeMint",
        args: [to],
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

  return { mintNft, loading, error };
};
