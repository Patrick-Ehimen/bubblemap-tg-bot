"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateGiniCoefficient = calculateGiniCoefficient;
/**
 * Calculate Gini coefficient for distribution analysis
 */
function calculateGiniCoefficient(values) {
    if (values.length <= 1)
        return 0;
    // Sort values in ascending order
    const sortedValues = [...values].sort((a, b) => a - b);
    const n = sortedValues.length;
    let numerator = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            numerator += Math.abs(sortedValues[i] - sortedValues[j]);
        }
    }
    const meanValue = sortedValues.reduce((sum, value) => sum + value, 0) / n;
    if (meanValue === 0)
        return 0;
    return numerator / (2 * n * n * meanValue);
}
