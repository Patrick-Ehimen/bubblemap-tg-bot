/**
 * Calculate total supply based on node amounts
 */
export function calculateTotalSupply(mapData: any): number | null {
  if (!mapData || !mapData.nodes || !Array.isArray(mapData.nodes)) {
    return null;
  }

  return mapData.nodes.reduce((total: number, node: any) => {
    return total + (node.amount || 0);
  }, 0);
}
