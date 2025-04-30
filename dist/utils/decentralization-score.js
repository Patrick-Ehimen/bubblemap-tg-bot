"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDecentralizationScore = calculateDecentralizationScore;
const calculate_coefficient_1 = require("./calculate-coefficient");
/**
 * Calculates a decentralization score based on token distribution
 * Used as a fallback if the API doesn't provide a score
 */
function calculateDecentralizationScore(mapData) {
    // Start with base score
    let score = 100;
    if (!mapData || !mapData.nodes || !Array.isArray(mapData.nodes)) {
        return 50; // Default score when data is insufficient
    }
    // Analyze concentration of tokens
    const sortedNodes = [...mapData.nodes]
        .filter((node) => node.percentage)
        .sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
    // Calculate Gini coefficient (measure of inequality)
    const percentages = sortedNodes.map((node) => node.percentage || 0);
    const giniCoefficient = (0, calculate_coefficient_1.calculateGiniCoefficient)(percentages);
    // Penalize based on Gini coefficient (higher inequality = lower score)
    score -= giniCoefficient * 50;
    // Check top holder concentration
    if (sortedNodes.length > 0) {
        // Top holder percentage
        const topHolderPercentage = sortedNodes[0].percentage || 0;
        // Penalize for high concentration in top holder
        if (topHolderPercentage > 10) {
            score -= (topHolderPercentage - 10) * 1.5;
        }
        // Check top 5 holders concentration
        const top5Percentage = sortedNodes
            .slice(0, 5)
            .reduce((sum, node) => sum + (node.percentage || 0), 0);
        // Penalize for high concentration in top 5 holders
        if (top5Percentage > 50) {
            score -= (top5Percentage - 50) * 0.8;
        }
    }
    // Penalize if there are very few holders
    if (sortedNodes.length < 100) {
        score -= (100 - sortedNodes.length) / 2;
    }
    // Ensure score is within bounds
    return Math.max(1, Math.min(99, score));
}
