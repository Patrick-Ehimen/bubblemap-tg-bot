import dotenv from "dotenv";
import { createBot } from "./bot/bot";

// Load environment variables
dotenv.config();

// Initialize and start the bot
const bot = createBot(process.env.TELEGRAM_BOT_TOKEN || "");

console.log("Starting the bot...");
bot
  .launch()
  .then(() => console.log("Bubblemaps Telegram Bot is running!"))
  .catch((err) => console.error("Error starting bot:", err));

// Enable graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
