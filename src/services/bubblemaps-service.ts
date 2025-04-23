import axios from "axios";
import puppeteer from "puppeteer";
import { TokenData, DecentralizationData, MapData } from "../types";

export type ChainType =
  | "eth"
  | "bsc"
  | "ftm"
  | "avax"
  | "cro"
  | "arbi"
  | "poly"
  | "base"
  | "sol"
  | "sonic";

const BUBBLEMAPS_FRONTEND_URL = "https://app.bubblemaps.io";

/**
 * Fetches token data from Bubblemaps API
 */
export async function getBubblemapData(
  contractAddress: string,
  chain: ChainType
): Promise<TokenData> {
  try {
    // Make API request to get map-data
    const mapDataResponse = await axios.get<MapData>(
      `https://api-legacy.bubblemaps.io/map-data?token=${contractAddress}&chain=${chain}`
    );

    // Make API request to get decentralization score
    const decentralizationResponse = await axios.get<DecentralizationData>(
      `https://api-legacy.bubblemaps.io/map-metadata?chain=${chain}&token=${contractAddress}`
    );

    // Extract data from responses
    const mapData = mapDataResponse.data;
    const decentralizationData = decentralizationResponse.data;

    // Process top holders
    const topHolders = processTopHolders(mapData);

    // Get decentralization score from API or calculate if not available
    let decentralizationScore = 50; // Default score
    let cexPercentage = 0;
    let contractPercentage = 0;

    if (decentralizationData && decentralizationData.decentralisation_score) {
      // Use the score from API
      decentralizationScore = decentralizationData.decentralisation_score;

      // Get percentage in CEXs and contracts if available
      if (decentralizationData.identified_supply) {
        cexPercentage =
          decentralizationData.identified_supply.percent_in_cexs || 0;
        contractPercentage =
          decentralizationData.identified_supply.percent_in_contracts || 0;
      }
    } else {
      // Calculate a score if not provided by API
      decentralizationScore = calculateDecentralizationScore(mapData);
    }

    // Extract token metadata
    const tokenName = mapData.full_name || "Unknown";
    const tokenSymbol = mapData.symbol || "Unknown";

    // Return processed token data
    return {
      name: tokenName,
      symbol: tokenSymbol,
      contractAddress: contractAddress,
      // These fields might not be available from the API
      price: null,
      marketCap: null,
      volume24h: null,
      totalSupply: calculateTotalSupply(mapData),
      holderCount: mapData.nodes ? mapData.nodes.length : 0,
      decentralizationScore: decentralizationScore,
      largestHolders: topHolders,
      network: chain.toUpperCase(),
      creationDate: mapData.dt_update,
      cexPercentage,
      contractPercentage,
    };
  } catch (error) {
    console.error("Error fetching Bubblemaps data:", error);
    throw new Error("Failed to fetch token data from Bubblemaps");
  }
}

/**
 * Calculate total supply based on node amounts
 */
function calculateTotalSupply(mapData: any): number | null {
  if (!mapData || !mapData.nodes || !Array.isArray(mapData.nodes)) {
    return null;
  }

  return mapData.nodes.reduce((total: number, node: any) => {
    return total + (node.amount || 0);
  }, 0);
}

/**
 * Processes map data to extract top holders
 */
function processTopHolders(mapData: any): Array<{
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

/**
 * Calculates a decentralization score based on token distribution
 * Used as a fallback if the API doesn't provide a score
 */
function calculateDecentralizationScore(mapData: any): number {
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
  const giniCoefficient = calculateGiniCoefficient(percentages);

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

/**
 * Calculate Gini coefficient for distribution analysis
 */
function calculateGiniCoefficient(values: number[]): number {
  if (values.length <= 1) return 0;

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
  if (meanValue === 0) return 0;

  return numerator / (2 * n * n * meanValue);
}

/**
 * Generates a screenshot of the bubblemap visualization
 */
export async function getBubblemapScreenshot(
  contractAddress: string,
  chain: ChainType
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });

  let page;
  try {
    page = await browser.newPage();

    // Set viewport to a reasonable size
    await page.setViewport({ width: 1200, height: 800 });

    // Navigate to the Bubblemaps page for the token
    console.log(
      `Navigating to ${BUBBLEMAPS_FRONTEND_URL}/${chain}/token/${contractAddress}`
    );
    await page.goto(
      `${BUBBLEMAPS_FRONTEND_URL}/${chain}/token/${contractAddress}`,
      {
        waitUntil: "networkidle2",
        timeout: 90000,
      }
    );

    // Wait for the visualization to load
    console.log("Waiting for visualization to load");
    await page.waitForSelector(
      ".bubblemap-container, .distribution-visualization",
      { timeout: 90000 }
    );

    // Give it a little more time to fully render
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Take a screenshot of the visualization
    console.log("Taking screenshot");
    const element = await page.$(
      ".bubblemap-container, .distribution-visualization"
    );
    if (!element) {
      throw new Error("Could not find visualization element on the page");
    }

    const screenshot = await element.screenshot({ type: "png" });

    return screenshot as Buffer;
  } catch (error: any) {
    console.error("Error in getBubblemapScreenshot:", error);
    throw new Error(`Failed to generate screenshot: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
