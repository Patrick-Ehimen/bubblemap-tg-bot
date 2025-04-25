/**
 * Processes map data to extract top holders
 */
export function processTopHolders(mapData: any): Array<{
  address: string;
  percentage: number;
  isContract: boolean;
  name?: string;
  amount?: number;
}> {
  const holders: Array<{
    address: string;
    percentage: number;
    isContract: boolean;
    name?: string;
    amount?: number;
  }> = [];

  // Extract nodes from map data
  if (mapData && mapData.nodes && Array.isArray(mapData.nodes)) {
    // Sort nodes by percentage (representing holdings) in descending order
    const sortedNodes = [...mapData.nodes]
      .filter((node) => node.address)
      .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
      .slice(0, 10); // Get top 10 holders

    sortedNodes.forEach((node) => {
      holders.push({
        address: node.address,
        percentage: node.percentage || 0,
        isContract: node.is_contract || false,
        name: node.name,
        amount: node.amount,
      });
    });
  }

  return holders;
}
