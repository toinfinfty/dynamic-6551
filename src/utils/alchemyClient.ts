import { Alchemy, Network } from "alchemy-sdk";

const config = {
  apiKey: process.env.ALCHEMY_API_KEY || "ZUI5KRPwQOKXrkbr6ZG6LYnwFLuhUJsl",
  network:
    process.env.BLOCKCHAIN_NETWORK === "mainnet"
      ? Network.ARB_MAINNET
      : Network.ARB_SEPOLIA,
  connectionInfoOverrides: {
    skipFetchSetup: true,
  },
};

export const alchemyClient = new Alchemy(config);
