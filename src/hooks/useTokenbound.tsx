// src/hooks/useTokenbound.ts
import { useContext } from "react";
import {
  TokenboundContext,
  TokenboundContextType,
} from "../contexts/TokenboundProvider";

export const useTokenbound = (): TokenboundContextType => {
  const context = useContext(TokenboundContext);

  if (!context) {
    throw new Error("useTokenbound must be used within a TokenboundProvider");
  }
  return context;
};
