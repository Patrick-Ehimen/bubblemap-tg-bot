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
exports.createBot = createBot;
/**
 * The `createBot` function sets up a Telegram bot that allows users to input a contract address,
 * select a blockchain, and receive detailed information and visualization using Bubblemaps service.
 * @param {string} token - The `token` parameter in the `createBot` function is the token required to
 * authenticate and connect to the Telegram Bot API. This token is provided by the BotFather when you
 * create a new bot on Telegram. It acts as a unique identifier for your bot and is necessary for
 * establishing a connection and
 * @returns The `createBot` function is returning an instance of the Telegraf bot that has been
 * configured with various commands and actions to handle user interactions related to fetching and
 * displaying bubblemap data for a given token contract address on different blockchain networks. The
 * function sets up commands for starting the bot, providing help instructions, handling text input
 * from users, and processing user selections for different blockchain networks. The bot instance is
 */
const telegraf_1 = require("telegraf");
const numeral_1 = __importDefault(require("numeral"));
const validators_1 = require("../utils/validators");
const formatters_1 = require("../utils/formatters");
const bubblemaps_service_1 = require("../services/bubblemaps-service");
const coingecko_service_1 = require("../services/coingecko-service");
const constants_1 = require("../constants");
function createBot(token) {
    const bot = new telegraf_1.Telegraf(token);
    const userSessions = new Map();
    const SUPPORTED_CHAINS = {
        "ETH: Ethereum": "eth",
        "BSC: Binance Smart Chain": "bsc",
        "FTM: Fantom": "ftm",
        "AVAX: Avalanche": "avax",
        "CRO: Cronos": "cro",
        "ARBI: Arbitrum": "arbi",
        "POLY: Polygon": "poly",
        "BASE: Base": "base",
        "SOL: Solana": "sol",
        "SONIC: Sonic": "sonic",
    };
    bot.start((ctx) => {
        ctx.reply("👋 Welcome to the Bubblemaps Bot!\n\n" +
            "Send me a contract address to get detailed information and visualization across multiple chains.☘️\n\n" +
            "In groups, tag me with the contract address.", telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.url("Add to Group", `https://t.me/${ctx.botInfo.username}?startgroup=true`),
        ]));
    });
    function isTextMessage(message) {
        return "text" in message;
    }
    // help command
    bot.help((ctx) => {
        // Respond to the help command with instructions on how to use the bot
        ctx.reply("How to use this bot 🤖:\n\n" +
            "1. Send a valid token contract address\n" +
            "2. Select the chain the token is on\n" +
            "3. Wait a moment while I fetch the data\n" +
            "4. I'll send you a bubblemap screenshot and token analysis\n\n" +
            "Supported chains ⛓️: ETH, BSC, FTM, AVAX, CRO, ARBI, POLY, BASE, SOL, SONIC\n\n" +
            "Example: 0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95 (BSC)");
    });
    bot.on("text", (ctx) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (ctx.message &&
            isTextMessage(ctx.message) &&
            !ctx.message.text.startsWith("/")) {
            if (ctx.chat.type === "group" || ctx.chat.type === "supergroup") {
                if (ctx.message.text.includes(`@${ctx.botInfo.username}`)) {
                    const text = ctx.message.text
                        .replace(`@${ctx.botInfo.username}`, "")
                        .trim();
                    if ((0, validators_1.isContractAddressValid)(text)) {
                        const address = text;
                        const userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return ctx.reply("Error: Could not identify user.");
                        }
                        userSessions.set(userId, { contractAddress: address });
                        const chainButtons = Object.keys(SUPPORTED_CHAINS).map((chainName) => telegraf_1.Markup.button.callback(chainName, `chain_${SUPPORTED_CHAINS[chainName]}`));
                        const keyboard = telegraf_1.Markup.inlineKeyboard(chainButtons.reduce((rows, button, index) => {
                            // Group buttons in pairs: push a new row if index is even, otherwise add to the last row
                            if (index % 2 === 0)
                                rows.push([button]);
                            else
                                rows[rows.length - 1].push(button);
                            return rows;
                        }, []));
                        ctx.reply("Please select the chain for this token:", keyboard);
                    }
                    else {
                        return;
                    }
                }
                else {
                    return;
                }
            }
            else {
                const text = ctx.message.text.trim();
                if ((0, validators_1.isContractAddressValid)(text)) {
                    const address = text;
                    const userId = (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id;
                    if (!userId) {
                        return ctx.reply("Error: Could not identify user.");
                    }
                    userSessions.set(userId, { contractAddress: address });
                    const chainButtons = Object.keys(SUPPORTED_CHAINS).map((chainName) => telegraf_1.Markup.button.callback(chainName, `chain_${SUPPORTED_CHAINS[chainName]}`));
                    const keyboard = telegraf_1.Markup.inlineKeyboard(chainButtons.reduce((rows, button, index) => {
                        // Group buttons in pairs: push a new row if index is even, otherwise add to the last row
                        if (index % 2 === 0)
                            rows.push([button]);
                        else
                            rows[rows.length - 1].push(button);
                        return rows;
                    }, []));
                    ctx.reply("Please select the chain for this token:", keyboard);
                }
            }
        }
    }));
    bot.on("text", (ctx) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const address = ctx.message.text.trim();
        const userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return ctx.reply("Error: Could not identify user.");
        }
        if (!(0, validators_1.isContractAddressValid)(address)) {
            return ctx.reply("Please provide a valid contract address. Example: 0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95");
        }
        userSessions.set(userId, { contractAddress: address });
        const chainButtons = Object.keys(SUPPORTED_CHAINS).map((chainName) => telegraf_1.Markup.button.callback(chainName, `chain_${SUPPORTED_CHAINS[chainName]}`));
        const keyboard = telegraf_1.Markup.inlineKeyboard(chainButtons.reduce((rows, button, index) => {
            // Group buttons in pairs: push a new row if index is even, otherwise add to the last row
            if (index % 2 === 0)
                rows.push([button]);
            else
                rows[rows.length - 1].push(button);
            return rows;
        }, []));
        ctx.reply("Please select the chain for this token:", keyboard);
    }));
    bot.action(/chain_(.+)/, (ctx) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const chainMatch = ctx.match[1];
        const userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId || !userSessions.has(userId)) {
            return ctx.reply("Session expired. Please send the contract address again.");
        }
        const { contractAddress } = userSessions.get(userId);
        try {
            yield ctx.editMessageText("Processing your request...please wait⌛️");
            const tokenData = yield (0, bubblemaps_service_1.getBubblemapData)(contractAddress, chainMatch);
            const screenshotBuffer = yield (0, bubblemaps_service_1.getBubblemapScreenshot)(contractAddress, chainMatch);
            const formattedData = (0, formatters_1.formatTokenData)(tokenData, chainMatch);
            const coinId = constants_1.CHAIN_TO_COIN_ID[chainMatch] || "";
            let coingeckoData = null;
            if (coinId) {
                coingeckoData = yield (0, coingecko_service_1.getCoinGeckoData)(coinId, contractAddress);
            }
            let caption = `*Bubblemap for ${tokenData.name} on ${chainMatch.toUpperCase()} network.*`;
            if (coingeckoData) {
                const firstSentence = coingeckoData.description.en.split(". ")[0] + ".";
                caption += `\n\n*Description:* ${firstSentence}\n\n*Market Cap (USD):* $${(0, numeral_1.default)(coingeckoData.market_data.market_cap.usd).format("0,0.00")}\n*Price (USD):* $${(0, numeral_1.default)(coingeckoData.market_data.current_price.usd).format("0,0.000")}\n*24h Volume (USD):* $${(0, numeral_1.default)(coingeckoData.market_data.total_volume.usd).format("0,0.00")}\n*24h Price Change (%):* ${(0, numeral_1.default)(coingeckoData.market_data.price_change_percentage_24h).format("0.00")}%`;
            }
            caption += `\n${formattedData}`;
            yield ctx.replyWithPhoto({ source: screenshotBuffer }, {
                caption: caption,
                parse_mode: "Markdown",
            });
            userSessions.delete(userId);
            yield ctx.deleteMessage();
        }
        catch (error) {
            console.error("Error processing request:", error);
            yield ctx.reply("Sorry, an error occurred. Please try again later.");
            yield ctx.deleteMessage().catch(() => { });
        }
    }));
    return bot;
}
