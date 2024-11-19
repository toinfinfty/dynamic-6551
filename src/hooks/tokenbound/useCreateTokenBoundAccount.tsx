import { useState } from "react";
import { useTokenbound } from "../useTokenbound";
import { Address } from "viem";
import debug from "debug";

/** Debug logger for the useCreateTokenboundAccount hook */
const log = debug("dynamic-6551:useCreateTokenboundAccount");

/**
 * Type representing the response from creating a token-bound account.
 *
 * @typedef {Object} CreateTokenboundAccountResponse
 * @property {`0x${string}`} account - The address of the created token-bound account.
 * @property {`0x${string}`} txHash - The transaction hash of the account creation.
 */
type CreateTokenboundAccountResponse = {
  account: `0x${string}`;
  txHash: `0x${string}`;
};

/**
 * Type representing the return value of the useCreateTokenboundAccount hook.
 *
 * @typedef {Object} UseCreateTokenboundAccount
 * @property {Function} createTokenboundAccount - Function to create a token-bound account.
 * @property {boolean} loading - Indicates if the creation process is in progress.
 * @property {string | null} error - Error message if the creation process fails.
 */
export type UseCreateTokenboundAccount = {
  createTokenboundAccount: (
    contractAddress: Address,
    tokenId: string
  ) => Promise<CreateTokenboundAccountResponse>;
  loading: boolean;
  error: string | null;
};

/**
 * Custom React hook to create a token-bound account using the Tokenbound client.
 *
 * @returns {UseCreateTokenboundAccount} An object containing the `createTokenboundAccount` function, `loading` state, and `error` state.
 */
export const useCreateTokenboundAccount = (): UseCreateTokenboundAccount => {
  const { tokenboundClient } = useTokenbound();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Function to create a token-bound account for a specific NFT.
   *
   * @param {Address} contractAddress - The address of the NFT contract.
   * @param {string} tokenId - The token ID of the NFT.
   * @returns {Promise<CreateTokenboundAccountResponse>} A promise that resolves to the account creation response.
   * @throws Will throw an error if the Tokenbound client is not initialized or if the account creation fails.
   */
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
