import { TokenData } from "../types";
import { ChainType } from "../../constants";

/**
 * Formats token data into a readable message
 */
export function formatTokenData(data: TokenData, chain: ChainType): string {
  // Format large numbers for better readability
  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return "N/A";
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const chainEmoji = getChainEmoji(chain);

  return `
  *Decentralization Score:* ${data.decentralizationScore.toFixed(1)}/100
  ${getDecentralizationComment(data.decentralizationScore)}
  
  *Supply Distribution:*
  *Total Supply:* ${data.totalSupply ? formatNumber(data.totalSupply) : "N/A"}
  ${
    (data.cexPercentage ?? 0) > 0
      ? `• ${(data.cexPercentage ?? 0).toFixed(2)}% in Centralized Exchanges`
      : ""
  }
  ${
    (data.contractPercentage ?? 0) > 0
      ? `• ${(data.contractPercentage ?? 0).toFixed(2)}% in Smart Contracts`
      : ""
  }
  [View on Bubblemaps](https://app.bubblemaps.io/${chain}/token/${
    data.contractAddress
  })
  ${getChainExplorer(chain, data.contractAddress)}
  `;
}

/**
 * Returns a comment about the decentralization score
 */
function getDecentralizationComment(score: number): string {
  if (score >= 85)
    return "📊 *Highly decentralized* - Well distributed token ownership";
  if (score >= 70)
    return "📊 *Moderately decentralized* - Good distribution with room for improvement";
  if (score >= 50)
    return "⚠️ *Somewhat centralized* - Several large holders have significant control";
  return "🚨 *Highly centralized* - Very concentrated ownership, exercise caution";
}

/**
 * Returns chain explorer link
 */
function getChainExplorer(chain: ChainType, address: string): string {
  const explorers: Record<ChainType, string> = {
    eth: `[View on Etherscan](https://etherscan.io/token/${address})`,
    bsc: `[View on BscScan](https://bscscan.com/token/${address})`,
    ftm: `[View on FTMScan](https://ftmscan.com/token/${address})`,
    avax: `[View on Snowtrace](https://snowtrace.io/token/${address})`,
    cro: `[View on Cronoscan](https://cronoscan.com/token/${address})`,
    arbi: `[View on Arbiscan](https://arbiscan.io/token/${address})`,
    poly: `[View on Polygonscan](https://polygonscan.com/token/${address})`,
    base: `[View on Basescan](https://basescan.org/token/${address})`,
    sol: `[View on Solscan](https://solscan.io/token/${address})`,
    sonic: `[View on Sonic Explorer](https://sonicscan.org/token/${address})`,
  };

  return explorers[chain];
}

/**
 * Returns emoji for chain
 */
function getChainEmoji(chain: ChainType): string {
  const emojis: Record<ChainType, string> = {
    eth: "⟠",
    bsc: "🔶",
    ftm: "👻",
    avax: "🔺",
    cro: "🔄",
    arbi: "🔵",
    poly: "🟣",
    base: "🟩",
    sol: "☀️",
    sonic: "🔊",
  };

  return emojis[chain];
}

/**
 * Truncates an address for display
 */
function truncateAddress(address: string): string {
  if (!address) return "Unknown";
  if (address.length <= 12) return address;
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
}
