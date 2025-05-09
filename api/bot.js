import { Telegraf } from 'telegraf';
import { Markup } from 'telegraf/markup';
import { InferenceClient } from "@huggingface/inference";
import { connectDB } from './db.js';
import { User } from '../models/User.js';
import 'dotenv/config';

// await User.create({ name: 'Alice', email: 'alice@example.com' });

const apiKey = process.env.HUGGINGFACE_TOKEN; // Hugging Face API-ключ
const API_KEY_BOT = process.env.TELEGRAM_TOKEN; // Telegram bot API key\

const userStates = new Map();

const generateAnswer = async (message) => {
    const chatCompletion = await client.chatCompletion({
        provider: "novita",
        model: "deepseek-ai/DeepSeek-V3-0324",
        messages: [
            {
                role: "user",
                content: `Я предоставлю тебе сейчас запрос от пользователя моего чат-бота. Твоя задача: ответить на сообщение пользователя в роли - пивного быдла, который не знает манер. Сообщение пользователя: ${message}`,
            },
        ],
    });
    
    return chatCompletion.choices[0].message.content
}

const client = new InferenceClient(apiKey); //client for AI messages
const bot = new Telegraf(API_KEY_BOT);

await connectDB();

bot.start((ctx) => {
  console.log('Start command received');
  ctx.reply('Welcome! Choose an option:', Markup.inlineKeyboard([
    [Markup.button.callback('Создать аккаунт', 'createAcc')],
    [Markup.button.callback('Option 2', 'option2')]
  ]));
});

bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;

    const inputText = ctx.message.text;
    const state = userStates.get(userId);

    switch (state) {
      case 'awaitingPhone':
        const sendNumber = await ctx.reply('Телефон: ', inputText);
        break;
    
      default:
        const sentMessage = await ctx.reply('Подожди...');
  
        try {
          const response = await generateAnswer(inputText);
      
          // Edit the original message with the response
          await ctx.telegram.editMessageText(
            chatId,
            sentMessage.message_id,
            null,
            response
          );
        } catch (error) {
          console.error('Error generating answer:', error);
          await ctx.reply('Произошла ошибка при генерации ответа.');
        }

        break;
    }
  });  
  
  bot.action('createAcc', ctx => {
    userStates.set(ctx.from.id, 'awaitingPhone');
    ctx.reply('Чтобы создать аккаунт пришлите: свой номер телефона');
  });
  bot.action('option2', ctx => ctx.reply('You chose option 2'));

  // Start the bot using long polling
  bot.launch().then(() => {
    console.log('🤖 Bot is up and running!');
  });
  
  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));