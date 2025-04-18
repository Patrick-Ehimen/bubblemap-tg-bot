import { Telegraf } from "telegraf";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize the bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "");

// Start command
bot.start((ctx) => {
  ctx.reply(
    "Welcome to the Bubblemaps Bot! Send me a contract address to get detailed information and visualization."
  );
});

// Help command
bot.help((ctx) => {
  ctx.reply(
    "How to use this bot:\n\n" +
      "1. Send a valid token contract address\n" +
      "2. Wait a moment while I fetch the data\n" +
      "3. I'll send you a bubblemap screenshot and token analysis\n\n" +
      "Example: 0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0 (Polygon)"
  );
});

// Start the bot
console.log("Starting the bot...");
bot
  .launch()
  .then(() => {
    console.log("Bubblemaps Telegram Bot is running!");
  })
  .catch((err) => {
    console.error("Error starting bot:", err);
  });

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
