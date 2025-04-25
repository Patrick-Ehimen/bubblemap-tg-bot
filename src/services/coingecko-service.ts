import axios from "axios";
import { CoinGeckoData } from "../types";

/**
 * Fetches data from CoinGecko API
 */
export async function getCoinGeckoData(
  coinId: string,
  contractAddress: string
): Promise<CoinGeckoData | null> {
  try {
    const apiKey = process.env.COINGECKO_API_KEY;

    const response = await axios.get<CoinGeckoData>(
      `https://api.coingecko.com/api/v3/coins/${coinId}/contract/${contractAddress}`,
      {
        headers: {
          accept: "application/json",
          "x-cg-demo-api-key": apiKey,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching CoinGecko data:", error);
    return null;
  }
}
