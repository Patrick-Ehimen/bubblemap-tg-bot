"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTotalSupply = calculateTotalSupply;
/**
 * Calculate total supply based on node amounts
 */
function calculateTotalSupply(mapData) {
    if (!mapData || !mapData.nodes || !Array.isArray(mapData.nodes)) {
        return null;
    }
    return mapData.nodes.reduce((total, node) => {
        return total + (node.amount || 0);
    }, 0);
}
