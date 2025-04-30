"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const bot_1 = require("./bot/bot");
// Load environment variables
dotenv_1.default.config();
// Initialize and start the bot
const bot = (0, bot_1.createBot)(process.env.TELEGRAM_BOT_TOKEN || "");
console.log("Starting the bot...");
bot
    .launch()
    .then(() => console.log("Bubblemaps Telegram Bot is running!"))
    .catch((err) => console.error("Error starting bot:", err));
// Enable graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
