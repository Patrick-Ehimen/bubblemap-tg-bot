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

export interface CoinGeckoData {
  description: {
    en: string;
  };
  market_data: {
    market_cap: {
      usd: number;
    };
    current_price: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    price_change_percentage_24h: number;
    ath: {
      usd: number;
    };
    atl: {
      usd: number;
    };
  };
}
