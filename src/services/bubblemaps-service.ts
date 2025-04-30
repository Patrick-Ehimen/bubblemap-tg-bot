import axios from "axios";
import puppeteer from "puppeteer";
import { TokenData, DecentralizationData, MapData } from "../types";
import { calculateTotalSupply } from "../utils/total-supply";
import { processTopHolders } from "../utils/top-holder";
import { calculateDecentralizationScore } from "../utils/decentralization-score";
import { ChainType, BUBBLEMAPS_FRONTEND_URL } from "../constants";
import dotenv from "dotenv";

dotenv.config();

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
 * Generates a screenshot of the bubblemap visualization
 */
export async function getBubblemapScreenshot(
  contractAddress: string,
  chain: ChainType
): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    console.log(
      `Navigating to ${BUBBLEMAPS_FRONTEND_URL}/${chain}/token/${contractAddress}`
    );
    await page.goto(
      `${BUBBLEMAPS_FRONTEND_URL}/${chain}/token/${contractAddress}`
    );

    await page.setViewport({ width: 1280, height: 720 });
    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log("Taking screenshot of the entire page");
    const screenshot = await page.screenshot({
      path: "bubblemap.png",
      fullPage: true,
      type: "png",
    });
    return screenshot as Buffer;
  } catch (error: any) {
    console.error("Error in getMapp:", error);
    throw new Error(`Failed to generate screenshot: ${error.message}`);
  } finally {
    await browser.close();
  }
}
