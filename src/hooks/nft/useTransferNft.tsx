// src/hooks/useTransferNft.ts
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { PARENT_ABI } from "../../utils/parentErc721ABI";
import { Address } from "viem";

export interface TransferNftParams {
  contractAddress: Address;
  fromAddress: Address;
  toAddress: Address;
  tokenId: string;
}

export const useTransferNft = () => {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transferNft = async (params: TransferNftParams) => {
    if (!walletClient) {
      throw new Error("No wallet client connected");
    }
    setLoading(true);
    setError(null);
    try {
      const tx = await walletClient.writeContract({
        address: params.contractAddress,
        abi: PARENT_ABI,
        functionName: "transferFrom",
        args: [params.fromAddress, params.toAddress, params.tokenId],
      });
      return tx;
    } catch (err) {
      console.error("Error transferring NFT:", err);
      setError("Failed to transfer NFT");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { transferNft, loading, error };
};
