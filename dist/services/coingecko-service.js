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
exports.getCoinGeckoData = getCoinGeckoData;
const axios_1 = __importDefault(require("axios"));
/**
 * Fetches data from CoinGecko API
 */
function getCoinGeckoData(coinId, contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const apiKey = process.env.COINGECKO_API_KEY;
            const response = yield axios_1.default.get(`https://api.coingecko.com/api/v3/coins/${coinId}/contract/${contractAddress}`, {
                headers: {
                    accept: "application/json",
                    "x-cg-demo-api-key": apiKey,
                },
            });
            // console.log("CoinGecko response:", response.data);
            return response.data;
        }
        catch (error) {
            console.error("Error fetching CoinGecko data:", error);
            return null;
        }
    });
}
