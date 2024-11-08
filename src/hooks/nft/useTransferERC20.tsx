import { useState } from "react";
import { useWalletClient } from "wagmi";
import { Address } from "viem";
import { ERC20ABI } from "../../utils/ERC20ABI";

export interface TransferERC20NftParams {
  contractAddress: Address;
  toAddress: Address;
  amount: number;
}

export const useTransferERC20 = () => {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transferERC20 = async (params: TransferERC20NftParams) => {
    if (!walletClient) {
      throw new Error("No wallet client connected");
    }
    setLoading(true);
    setError(null);
    try {
      const tx = await walletClient.writeContract({
        address: params.contractAddress,
        abi: ERC20ABI,
        functionName: "transfer",
        args: [
          params.toAddress,
          params.amount,
        ],
      });
      return tx;
    } catch (err) {
      console.error("Error transferring ERC20:", err);
      setError("Failed to transfer ERC20");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { transferERC20, loading, error };
};
