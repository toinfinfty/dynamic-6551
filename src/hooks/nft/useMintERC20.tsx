// src/hooks/useMintNft.ts
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { ERC20ABI } from "../../utils/ERC20ABI";

export const useMintERC20 = () => {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mintERC20 = async (contractAddress: string, amount: number) => {
    if (!walletClient) {
      throw new Error("No wallet client connected");
    }
    setLoading(true);
    setError(null);
    const account = walletClient.account;
    try {
      const tx = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: ERC20ABI,
        functionName: "mint",
        args: [account.address, amount],
      });
      return tx;
    } catch (err) {
      console.error("Error minting ERC20:", err);
      setError("Failed to mint ERC20");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mintERC20, loading, error };
};
