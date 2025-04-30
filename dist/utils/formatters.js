"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTokenData = formatTokenData;
/**
 * Formats token data into a readable message
 */
function formatTokenData(data, chain) {
    var _a, _b, _c, _d;
    // Format large numbers for better readability
    const formatNumber = (num) => {
        if (num === null || num === undefined)
            return "N/A";
        if (num >= 1e9)
            return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6)
            return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3)
            return `${(num / 1e3).toFixed(2)}K`;
        return num.toFixed(2);
    };
    const chainEmoji = getChainEmoji(chain);
    return `
  *Decentralization Score:* ${data.decentralizationScore.toFixed(1)}/100
  ${getDecentralizationComment(data.decentralizationScore)}
  
  *Supply Distribution:*
  *Total Supply:* ${data.totalSupply ? formatNumber(data.totalSupply) : "N/A"}
  ${((_a = data.cexPercentage) !== null && _a !== void 0 ? _a : 0) > 0
        ? `• ${((_b = data.cexPercentage) !== null && _b !== void 0 ? _b : 0).toFixed(2)}% in Centralized Exchanges`
        : ""}
  ${((_c = data.contractPercentage) !== null && _c !== void 0 ? _c : 0) > 0
        ? `• ${((_d = data.contractPercentage) !== null && _d !== void 0 ? _d : 0).toFixed(2)}% in Smart Contracts`
        : ""}
  [View on Bubblemaps](https://app.bubblemaps.io/${chain}/token/${data.contractAddress})
  ${getChainExplorer(chain, data.contractAddress)}
  `;
}
/**
 * Returns a comment about the decentralization score
 */
function getDecentralizationComment(score) {
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
function getChainExplorer(chain, address) {
    const explorers = {
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
function getChainEmoji(chain) {
    const emojis = {
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
function truncateAddress(address) {
    if (!address)
        return "Unknown";
    if (address.length <= 12)
        return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}
