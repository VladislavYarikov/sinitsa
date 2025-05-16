import { Telegraf } from 'telegraf';
import { connectDB } from './api/db.js';
import { messageHandlers, actionHandlers } from './handlers/handlerArray.js';
import { startRegistration, endRegistration } from './actions/registration.js';
import { login } from './actions/login.js';
import { start, menu } from './utils/telegram.js';
import { profile } from './actions/profile.js';
import { startQuiz } from './actions/quiz.js';
import { endProcess } from './actions/end.js';
import { BOT_TOKEN } from './config.js';
import 'dotenv/config';

const bot = new Telegraf(BOT_TOKEN);

// Регистрация команд и действий
bot.start(start);
bot.command('menu', menu);

bot.on('message', async (ctx) => {
  for (const handler of messageHandlers) {
    if (handler.canHandle(ctx)) {
      console.log(`Processing message with ${handler.constructor.name} for user ${ctx.from.id}`);
      await handler.handle(ctx);
      break;
    }
  }
});
bot.on('poll_answer', async (ctx) => {
  for (const handler of actionHandlers) {
    if (handler.canHandle(ctx)) {
      console.log(`Processing poll answer with ${handler.constructor.name} for user ${ctx.from.id}`);
      await handler.handle(ctx);
      break;
    }
  }
});

bot.action('start_registration', startRegistration);
bot.action('end_registration', endRegistration);
bot.action('loginAcc', login);
bot.action('profile', profile);
bot.action('start_quiz', startQuiz);
bot.action('end_process', endProcess);

// Запуск бота
async function launchBot() {
  try {
    await connectDB();
    if (process.env.STATE === 'DEV') {
      console.log('Starting bot in DEV mode...');
      bot.launch();
    } else if (process.env.STATE === 'PRODUCTION') {
      console.log('Starting bot in PRODUCTION mode...');
      bot.launch();
    } else {
      console.error('Invalid STATE environment variable. Bot not started.');
    }
  } catch (error) {
    console.error('Failed to launch bot:', error);
    process.exit(1);
  }
}

launchBot();

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));