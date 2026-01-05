import { Bot, Context, InlineKeyboard } from "grammy";

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED_USER_IDS = (process.env.ALLOWED_USER_IDS ?? "")
  .split(",")
  .map((id) => parseInt(id.trim(), 10))
  .filter((id) => !isNaN(id));
const MIRANDA_PORT = parseInt(process.env.MIRANDA_PORT ?? "3847", 10);

if (!BOT_TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN environment variable is required");
  process.exit(1);
}

if (ALLOWED_USER_IDS.length === 0) {
  console.warn("Warning: ALLOWED_USER_IDS not set, bot will reject all users");
}

// Create bot instance
const bot = new Bot(BOT_TOKEN);

// Auth middleware
bot.use(async (ctx, next) => {
  const userId = ctx.from?.id;
  if (!userId || !ALLOWED_USER_IDS.includes(userId)) {
    console.log(`Rejected request from user ${userId}`);
    return;
  }
  await next();
});

// Commands
bot.command("start", async (ctx) => {
  await ctx.reply(
    `🎭 *Miranda* - Remote Claude Orchestration

I give voice to the Primer. Commands:

/mouse <task-id> - Start a mouse on a task
/status - Show active sessions
/drummer - Run batch merge
/stop <task-id> - Stop a session
/logs <task-id> - View session logs
/ssh - Get SSH command

_From The Diamond Age by Neal Stephenson_`,
    { parse_mode: "Markdown" }
  );
});

bot.command("mouse", async (ctx) => {
  const taskId = ctx.match?.trim();
  if (!taskId) {
    await ctx.reply("Usage: /mouse <task-id>");
    return;
  }

  // TODO: Implement tmux session spawning
  await ctx.reply(
    `🐭 Starting mouse for ${taskId}...\n\n_Not yet implemented_`,
    { parse_mode: "Markdown" }
  );
});

bot.command("status", async (ctx) => {
  // TODO: Implement status check
  await ctx.reply(
    `🏭 *Remote Claude Status*

_No active sessions_

_Not yet implemented_`,
    { parse_mode: "Markdown" }
  );
});

bot.command("drummer", async (ctx) => {
  // TODO: Implement drummer
  await ctx.reply(
    `🥁 *Drummer* - Batch Review\n\n_Not yet implemented_`,
    { parse_mode: "Markdown" }
  );
});

bot.command("stop", async (ctx) => {
  const taskId = ctx.match?.trim();
  if (!taskId) {
    await ctx.reply("Usage: /stop <task-id>");
    return;
  }

  // TODO: Implement session stopping
  await ctx.reply(`Stopping ${taskId}...\n\n_Not yet implemented_`);
});

bot.command("logs", async (ctx) => {
  const taskId = ctx.match?.trim();
  if (!taskId) {
    await ctx.reply("Usage: /logs <task-id>");
    return;
  }

  // TODO: Implement log viewing
  await ctx.reply(`Logs for ${taskId}...\n\n_Not yet implemented_`);
});

bot.command("ssh", async (ctx) => {
  // TODO: Get actual hostname
  await ctx.reply(
    `\`\`\`
ssh hetzner
tmux attach
\`\`\``,
    { parse_mode: "Markdown" }
  );
});

// Callback query handler for inline keyboards
bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;
  console.log("Callback received:", data);

  // TODO: Parse callback data and inject response via tmux send-keys

  await ctx.answerCallbackQuery({ text: "Response sent!" });
});

// Error handling
bot.catch((err) => {
  console.error("Bot error:", err);
});

// Start bot
console.log("🎭 Miranda starting...");
console.log(`   Allowed users: ${ALLOWED_USER_IDS.join(", ") || "(none)"}`);
console.log(`   Hook port: ${MIRANDA_PORT}`);

bot.start({
  onStart: (info) => {
    console.log(`   Bot: @${info.username}`);
    console.log("🎭 Miranda is ready");
  },
});

// TODO: Start HTTP server for hook notifications on MIRANDA_PORT
