import { useState } from "react";
import { useWalletClient } from "wagmi";
import { Address } from "viem";
import { ERC20ABI } from "../../utils/ERC20ABI";
import debug from "debug";

const log = debug("dynamic-6551:useBurnERC20");

export const useBurnERC20 = () => {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const burnERC20 = async (contractAddress: Address, amount: number) => {
    if (!walletClient) {
      const errorMsg = "No wallet client connected";
      log(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(true);
    setError(null);
    log(`Attempting to burn ${amount} tokens from contract at address: ${contractAddress}`);

    try {
      const tx = await walletClient.writeContract({
        address: contractAddress,
        abi: ERC20ABI,
        functionName: "burn",
        args: [amount],
      });
      log(`Burn transaction sent successfully`);
      return tx;
    } catch (err) {
      log("Error burning ERC20 token:", err);
      console.error("Error burning ERC20:", err);
      setError("Failed to burn ERC20");
      throw err;
    } finally {
      setLoading(false);
      log(`Burn operation completed for contract address: ${contractAddress}`);
    }
  };

  return { burnERC20, loading, error };
};
