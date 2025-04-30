"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBubblemapData = getBubblemapData;
exports.getBubblemapScreenshot = getBubblemapScreenshot;
const axios_1 = __importDefault(require("axios"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const total_supply_1 = require("../utils/total-supply");
const top_holder_1 = require("../utils/top-holder");
const decentralization_score_1 = require("../utils/decentralization-score");
const constants_1 = require("../constants");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Fetches token data from Bubblemaps API
 */
function getBubblemapData(contractAddress, chain) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Make API request to get map-data
            const mapDataResponse = yield axios_1.default.get(`https://api-legacy.bubblemaps.io/map-data?token=${contractAddress}&chain=${chain}`);
            // Make API request to get decentralization score
            const decentralizationResponse = yield axios_1.default.get(`https://api-legacy.bubblemaps.io/map-metadata?chain=${chain}&token=${contractAddress}`);
            // Extract data from responses
            const mapData = mapDataResponse.data;
            const decentralizationData = decentralizationResponse.data;
            // Process top holders
            const topHolders = (0, top_holder_1.processTopHolders)(mapData);
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
            }
            else {
                // Calculate a score if not provided by API
                decentralizationScore = (0, decentralization_score_1.calculateDecentralizationScore)(mapData);
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
                totalSupply: (0, total_supply_1.calculateTotalSupply)(mapData),
                holderCount: mapData.nodes ? mapData.nodes.length : 0,
                decentralizationScore: decentralizationScore,
                largestHolders: topHolders,
                network: chain.toUpperCase(),
                creationDate: mapData.dt_update,
                cexPercentage,
                contractPercentage,
            };
        }
        catch (error) {
            console.error("Error fetching Bubblemaps data:", error);
            throw new Error("Failed to fetch token data from Bubblemaps");
        }
    });
}
/**
 * Generates a screenshot of the bubblemap visualization
 */
function getBubblemapScreenshot(contractAddress, chain) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_1.default.launch();
        const page = yield browser.newPage();
        try {
            console.log(`Navigating to ${constants_1.BUBBLEMAPS_FRONTEND_URL}/${chain}/token/${contractAddress}`);
            yield page.goto(`${constants_1.BUBBLEMAPS_FRONTEND_URL}/${chain}/token/${contractAddress}`);
            yield page.setViewport({ width: 1280, height: 720 });
            yield new Promise((resolve) => setTimeout(resolve, 5000));
            console.log("Taking screenshot of the entire page");
            const screenshot = yield page.screenshot({
                path: "bubblemap.png",
                fullPage: true,
                type: "png",
            });
            return screenshot;
        }
        catch (error) {
            console.error("Error in getMapp:", error);
            throw new Error(`Failed to generate screenshot: ${error.message}`);
        }
        finally {
            yield browser.close();
        }
    });
}
