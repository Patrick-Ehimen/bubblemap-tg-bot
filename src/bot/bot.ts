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
import { Telegraf, Markup } from "telegraf";
import { isContractAddressValid } from "../utils/validators";
import { formatTokenData } from "../utils/formatters";
import {
  ChainType,
  getBubblemapData,
  getBubblemapScreenshot,
} from "../services/bubblemaps-service";

export function createBot(token: string) {
  const bot = new Telegraf(token);
  const userSessions = new Map<number, { contractAddress: string }>();

  const SUPPORTED_CHAINS: { [key: string]: ChainType } = {
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
    ctx.reply(
      "Welcome to the Bubblemaps Bot! Send me a contract address to get detailed information and visualization across multiple chains."
    );
  });

  // help command
  bot.help((ctx) => {
    // Respond to the help command with instructions on how to use the bot
    ctx.reply(
      "How to use this bot:\n\n" +
        "1. Send a valid token contract address\n" +
        "2. Select the chain the token is on\n" +
        "3. Wait a moment while I fetch the data\n" +
        "4. I'll send you a bubblemap screenshot and token analysis\n\n" +
        "Supported chains: ETH, BSC, FTM, AVAX, CRO, ARBI, POLY, BASE, SOL, SONIC\n\n" +
        "Example: 0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95 (BSC)"
    );
  });

  bot.on("text", async (ctx) => {
    const address = ctx.message.text.trim();
    const userId = ctx.from?.id;

    if (!userId) {
      return ctx.reply("Error: Could not identify user.");
    }

    if (!isContractAddressValid(address)) {
      return ctx.reply(
        "Please provide a valid contract address. Example: 0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95"
      );
    }

    userSessions.set(userId, { contractAddress: address });

    const chainButtons = Object.keys(SUPPORTED_CHAINS).map((chainName) =>
      Markup.button.callback(chainName, `chain_${SUPPORTED_CHAINS[chainName]}`)
    );

    const keyboard = Markup.inlineKeyboard(
      chainButtons.reduce<any[][]>((rows, button, index) => {
        // Group buttons in pairs: push a new row if index is even, otherwise add to the last row
        if (index % 2 === 0) rows.push([button]);
        else rows[rows.length - 1].push(button);
        return rows;
      }, [])
    );

    ctx.reply("Please select the chain for this token:", keyboard);
  });

  bot.action(/chain_(.+)/, async (ctx) => {
    const chainMatch = ctx.match[1] as ChainType;
    const userId = ctx.from?.id;

    if (!userId || !userSessions.has(userId)) {
      return ctx.reply(
        "Session expired. Please send the contract address again."
      );
    }

    const { contractAddress } = userSessions.get(userId)!;

    try {
      await ctx.editMessageText("Processing your request...please wait");

      const tokenData = await getBubblemapData(contractAddress, chainMatch);
      const screenshotBuffer = await getBubblemapScreenshot(
        contractAddress,
        chainMatch
      );
      const formattedData = formatTokenData(tokenData, chainMatch);

      await ctx.replyWithPhoto(
        { source: screenshotBuffer },
        {
          caption: `Bubblemap for ${
            tokenData.name
          } on ${chainMatch.toUpperCase()} network\n\n[View on Bubblemaps](https://app.bubblemaps.io/${chainMatch}/token/${
            tokenData.contractAddress
          })`,
          parse_mode: "Markdown",
        }
      );

      await ctx.reply(formattedData, { parse_mode: "Markdown" });
      userSessions.delete(userId);
      await ctx.deleteMessage();
    } catch (error) {
      console.error("Error processing request:", error);
      await ctx.reply("Sorry, an error occurred. Please try again later.");
      await ctx.deleteMessage().catch(() => {});
    }
  });

  return bot;
}
