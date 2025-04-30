import dotenv from "dotenv";
import { createBot } from "./bot/bot";
import http from "http";

// Load environment variables
dotenv.config();

// Initialize and start the bot
const bot = createBot(process.env.TELEGRAM_BOT_TOKEN || "");

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bubblemaps Bot is running!");
});

// Get port from environment variable or use 3000 as default
const port = process.env.PORT || 3000;

// Start both the HTTP server and the bot
Promise.all([
  // Start HTTP server
  new Promise<void>((resolve) => {
    server.listen(port, () => {
      console.log(`HTTP server is running on port ${port}`);
      resolve();
    });
  }),
  // Start Telegram bot
  bot
    .launch()
    .then(() => console.log("Bubblemaps Telegram Bot is running!"))
    .catch((err) => console.error("Error starting bot:", err)),
])
  .then(() => console.log("All services started successfully"))
  .catch((err) => console.error("Error during startup:", err));

// Enable graceful shutdown
const shutdown = () => {
  server.close(() => console.log("HTTP server closed"));
  bot.stop("SIGTERM");
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
