"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTopHolders = processTopHolders;
/**
 * Processes map data to extract top holders
 */
function processTopHolders(mapData) {
    const holders = [];
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
