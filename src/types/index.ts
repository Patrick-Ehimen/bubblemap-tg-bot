export interface TokenData {
  name: string;
  symbol: string;
  contractAddress: string;
  price?: number | null;
  marketCap?: number | null;
  volume24h?: number | null;
  totalSupply?: number | null;
  holderCount?: number;
  decentralizationScore: number;
  largestHolders: Array<{
    address: string;
    percentage: number;
    isContract: boolean;
    name?: string;
    amount?: number;
  }>;
  network?: string;
  creationDate?: string;
  cexPercentage?: number;
  contractPercentage?: number;
}

export interface DecentralizationData {
  decentralisation_score?: number;
  identified_supply?: {
    percent_in_cexs?: number;
    percent_in_contracts?: number;
  };
}

export interface MapData {
  full_name?: string;
  symbol?: string;
  nodes?: Array<{
    address: string;
    percentage: number;
    is_contract: boolean;
    name?: string;
    amount?: number;
  }>;
  dt_update?: string;
}
