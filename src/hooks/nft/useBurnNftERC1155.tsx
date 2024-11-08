// src/hooks/useBurnNft.ts
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { Address } from "viem";
import { ERC1155ABI } from "../../utils/ERC1155ABI";

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
      throw new Error("No wallet client connected");
    }
    setLoading(true);
    setError(null);
    const account = walletClient.account;
    try {
      const tx = await walletClient.writeContract({
        address: contractAddress,
        abi: ERC1155ABI,
        functionName: "burn",
        args: [account.address, tokenId, quantity],
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

  return { burnNftERC1155, loading, error };
};
