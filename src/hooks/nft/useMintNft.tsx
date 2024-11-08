import { useState } from "react";
import { useWalletClient } from "wagmi";
import { ERC721ABI } from "../../utils/ERC721ABI";
import { Address } from "viem";
import debug from "debug";

const log = debug("myLibrary:useMintNft");

export const useMintNft = () => {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mintNft = async (contractAddress: string, to: Address) => {
    if (!walletClient) {
      const errorMsg = "No wallet client connected";
      log(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(true);
    setError(null);
    log(
      `Attempting to mint NFT to address: ${to} at contract address: ${contractAddress}`
    );

    try {
      const tx = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: ERC721ABI,
        functionName: "safeMint",
        args: [to],
      });
      log(`Mint transaction sent successfully`);
      return tx;
    } catch (err) {
      log("Error minting NFT:", err);
      console.error("Error minting NFT:", err);
      setError("Failed to mint NFT");
      throw err;
    } finally {
      setLoading(false);
      log(`Mint operation completed for contract address: ${contractAddress}`);
    }
  };

  return { mintNft, loading, error };
};
