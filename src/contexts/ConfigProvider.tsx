import React, { createContext, useContext } from "react";
import { Alchemy } from "alchemy-sdk";
import { WagmiConfigProvider } from "./WagmiConfigProvider";
import { TokenboundProvider } from "./TokenboundProvider";

interface ConfigProviderProps {
  alchemyClient: Alchemy;
  children: React.ReactNode;
}
interface ConfigContextProps {
  alchemyClient: Alchemy;
}

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined);
export const ConfigProvider = ({
  alchemyClient,
  children,
}: ConfigProviderProps) => {
  return (
    <ConfigContext.Provider value={{ alchemyClient }}>
      <WagmiConfigProvider>
        <TokenboundProvider>{children}</TokenboundProvider>
      </WagmiConfigProvider>
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};
