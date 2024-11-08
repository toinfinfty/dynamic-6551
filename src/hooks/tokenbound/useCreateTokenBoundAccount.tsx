// src/hooks/useCreateTokenboundAccount.ts
import { useState } from "react";
import { useTokenbound } from "../useTokenbound";
import { Address } from "viem";

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
      throw new Error("TokenboundClient not initialized");
    }
    setLoading(true);
    setError(null);

    try {
      const response = await tokenboundClient.createAccount({
        tokenContract: contractAddress,
        tokenId,
      });

      const accountAddress = await tokenboundClient.getAccount({
        tokenContract: contractAddress,
        tokenId,
      });

      const isDeployed = await tokenboundClient.checkAccountDeployment({
        accountAddress,
      });

      if (!isDeployed) {
        throw new Error("Failed to deploy account");
      }

      return response;
    } catch (err) {
      console.error("Error creating token-bound account:", err);
      setError("Failed to create token-bound account");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createTokenboundAccount, loading, error };
};
