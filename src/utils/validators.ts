/**
 * Validates if a string is a valid contract address
 */
export function isContractAddressValid(address: string): boolean {
  // Basic validation - checks if it's a string that looks like a contract address
  // This handles Ethereum-style addresses (ETH, BSC, AVAX, etc.)
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return true;
  }

  // For Solana addresses
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return true;
  }

  return false;
}
