import { useState } from "react";
import { useWalletClient } from "wagmi";
import { ERC20ABI } from "../../utils/ERC20ABI";
import debug from "debug";

const log = debug("dynamic-6551:useMintERC20");

export const useMintERC20 = () => {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mintERC20 = async (contractAddress: string, amount: number) => {
    if (!walletClient) {
      const errorMsg = "No wallet client connected";
      log(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(true);
    setError(null);
    const account = walletClient.account;
    log(
      `Attempting to mint ${amount} ERC-20 tokens at contract address: ${contractAddress} for account: ${account?.address}`
    );

    try {
      const tx = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: ERC20ABI,
        functionName: "mint",
        args: [account.address, amount],
      });
      log(`Mint transaction sent successfully`);
      return tx;
    } catch (err) {
      log("Error minting ERC20 token:", err);
      console.error("Error minting ERC20:", err);
      setError("Failed to mint ERC20");
      throw err;
    } finally {
      setLoading(false);
      log(`Mint operation completed for contract address: ${contractAddress}`);
    }
  };

  return { mintERC20, loading, error };
};
