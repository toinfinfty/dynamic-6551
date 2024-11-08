/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";
import { getNetworkConfig } from "../utils/networkConfig";

export const WagmiConfigProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient();
  return (
    <WagmiProvider
      config={createConfig({
        chains: [getNetworkConfig()],
        connectors: [metaMask()],
        ssr: true,
        transports: {
          42161: http(),
          421614: http(),
        },
      })}
    >
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
