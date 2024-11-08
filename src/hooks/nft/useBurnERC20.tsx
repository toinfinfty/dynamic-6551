// src/hooks/useBurnNft.ts
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { Address } from "viem";
import { ERC20ABI } from "../../utils/ERC20ABI";

export const useBurnERC20 = () => {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const burnERC20 = async (contractAddress: Address, amount: number) => {
    if (!walletClient) {
      throw new Error("No wallet client connected");
    }
    setLoading(true);
    setError(null);
    try {
      const tx = await walletClient.writeContract({
        address: contractAddress,
        abi: ERC20ABI,
        functionName: "burn",
        args: [amount],
      });
      return tx;
    } catch (err) {
      console.error("Error burning ERC20:", err);
      setError("Failed to burn ERC20");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { burnERC20, loading, error };
};
