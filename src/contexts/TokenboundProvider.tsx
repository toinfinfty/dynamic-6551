/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useState, useEffect } from "react";
import { TokenboundClient } from "@tokenbound/sdk";
import { useAccount } from "wagmi";
import { getNetworkConfig } from "../utils/networkConfig";
import { createWalletClient, custom } from "viem";
import debug from "debug";

const log = debug("myLibrary:TokenboundProvider");

export interface TokenboundContextType {
  tokenboundClient: TokenboundClient | null;
  address: `0x${string}` | undefined;
}

export const TokenboundContext = createContext<
  TokenboundContextType | undefined
>(undefined);

export const TokenboundProvider = ({ children }: { children: any }) => {
  const [tokenboundClient, setTokenboundClient] =
    useState<TokenboundClient | null>(null);
  const { address } = useAccount();

  useEffect(() => {
    const initClient = async () => {
      if (!address || !window.ethereum) {
        log("Address or Ethereum provider not found. Skipping initialization.");
        return;
      }
      try {
        log("Initializing TokenboundClient with address:", address);
        const networkConfig = getNetworkConfig();
        log("Using network configuration:", networkConfig);

        const walletClient = createWalletClient({
          account: address,
          chain: networkConfig,
          transport: custom(window.ethereum),
        });

        const client = new TokenboundClient({
          walletClient,
          chain: networkConfig,
        });

        setTokenboundClient(client);
        log("TokenboundClient initialized successfully");
      } catch (error) {
        log("Failed to initialize TokenboundClient:", error);
        console.error("Failed to initialize TokenboundClient", error);
      }
    };

    initClient();
  }, [address]);

  return (
    <TokenboundContext.Provider value={{ tokenboundClient, address }}>
      {children}
    </TokenboundContext.Provider>
  );
};
