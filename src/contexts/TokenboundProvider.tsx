// src/contexts/TokenboundProvider.tsx
import { createContext, useState, useEffect } from "react";
import { TokenboundClient } from "@tokenbound/sdk";
import { useAccount } from "wagmi";
import { getNetworkConfig } from "../utils/networkConfig";
import { createWalletClient, custom } from "viem";

export interface TokenboundContextType {
  tokenboundClient: TokenboundClient | null;
  address: `0x${string}` | undefined;
}

export const TokenboundContext = createContext<
  TokenboundContextType | undefined
>(undefined);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TokenboundProvider = ({ children }: { children: any }) => {
  const [tokenboundClient, setTokenboundClient] =
    useState<TokenboundClient | null>(null);
  const { address } = useAccount();

  useEffect(() => {
    const initClient = async () => {
      if (!address || !window.ethereum) {
        return;
      }
      try {
        const networkConfig = getNetworkConfig();

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
      } catch (error) {
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
