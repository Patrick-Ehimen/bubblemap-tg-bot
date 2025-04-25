export const CHAIN_TO_COIN_ID: { [key: string]: string } = {
  sol: "solana",
  eth: "ethereum",
  bsc: "binancecoin",
  ftm: "fantom",
  avax: "avalanche-2",
  cro: "cronos",
  arbi: "arbitrum",
  poly: "matic-network",
  base: "base",
  sonic: "sonic",
};

export type ChainType =
  | "eth"
  | "bsc"
  | "ftm"
  | "avax"
  | "cro"
  | "arbi"
  | "poly"
  | "base"
  | "sol"
  | "sonic";

export const BUBBLEMAPS_FRONTEND_URL = "https://app.bubblemaps.io";
