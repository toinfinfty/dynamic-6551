import { arbitrum, arbitrumSepolia } from "wagmi/chains";

export const getNetworkConfig = () => {
  const network = process.env.BLOCKCHAIN_NETWORK;
  if (network === "mainnet") {
    return arbitrum;
  } else {
    return arbitrumSepolia; // Default to Sepolia if no valid env is set
  }
};
