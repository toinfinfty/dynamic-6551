import { useState } from "react";
import { useTokenbound } from "../useTokenbound";
import { Address } from "viem";
import debug from "debug";

const log = debug("dynamic-6551:useCreateTokenboundAccount");

type CreateTokenboundAccountResponse = {
  account: `0x${string}`;
  txHash: `0x${string}`;
};

export type UseCreateTokenboundAccount = {
  createTokenboundAccount: (
    contractAddress: Address,
    tokenId: string
  ) => Promise<CreateTokenboundAccountResponse>;
  loading: boolean;
  error: string | null;
};

export const useCreateTokenboundAccount = (): UseCreateTokenboundAccount => {
  const { tokenboundClient } = useTokenbound();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTokenboundAccount = async (
    contractAddress: Address,
    tokenId: string
  ): Promise<CreateTokenboundAccountResponse> => {
    if (!tokenboundClient) {
      const errorMsg = "TokenboundClient not initialized";
      log(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(true);
    setError(null);
    log(
      `Starting token-bound account creation for contract ${contractAddress}, tokenId: ${tokenId}`
    );

    try {
      const response = await tokenboundClient.createAccount({
        tokenContract: contractAddress,
        tokenId,
      });
      log(`Account creation transaction sent, txHash: ${response.txHash}`);

      const accountAddress = await tokenboundClient.getAccount({
        tokenContract: contractAddress,
        tokenId,
      });
      log(`Retrieved token-bound account address: ${accountAddress}`);

      const isDeployed = await tokenboundClient.checkAccountDeployment({
        accountAddress,
      });
      log(`Account deployment status for ${accountAddress}: ${isDeployed}`);

      if (!isDeployed) {
        const deployError = "Failed to deploy account";
        log(deployError);
        throw new Error(deployError);
      }

      log(
        `Token-bound account created successfully for ${contractAddress} with tokenId ${tokenId}`
      );
      return response;
    } catch (err) {
      log("Error creating token-bound account:", err);
      console.error("Error creating token-bound account:", err);
      setError("Failed to create token-bound account");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createTokenboundAccount, loading, error };
};
