import { useState } from "react";
import { useWalletClient } from "wagmi";
import { PARENT_ABI } from "../../utils/parentErc721ABI";
import { Address } from "viem";
import debug from "debug";

const log = debug("dynamic-6551:useTransferNft");

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
      const errorMsg = "No wallet client connected";
      log(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(true);
    setError(null);
    log(
      `Attempting to transfer NFT with tokenId ${params.tokenId} from ${params.fromAddress} to ${params.toAddress} at contract address: ${params.contractAddress}`
    );

    try {
      // Execute the transfer transaction
      const tx = await walletClient.writeContract({
        address: params.contractAddress,
        abi: PARENT_ABI,
        functionName: "transferFrom",
        args: [params.fromAddress, params.toAddress, params.tokenId],
      });
      log(`Transfer transaction sent successfully`);
      return tx;
    } catch (err) {
      log("Error transferring NFT:", err);
      console.error("Error transferring NFT:", err);
      setError("Failed to transfer NFT");
      throw err;
    } finally {
      setLoading(false);
      log(
        `Transfer operation completed for tokenId ${params.tokenId} at contract address: ${params.contractAddress}`
      );
    }
  };

  return { transferNft, loading, error };
};
