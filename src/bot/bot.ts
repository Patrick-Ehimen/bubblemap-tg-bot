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
      await ctx.editMessageText("Processing your request...");

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
          } on ${chainMatch.toUpperCase()}`,
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
