import { Telegraf } from 'telegraf';
import { Markup } from 'telegraf';
import { InferenceClient } from "@huggingface/inference";
import { connectDB } from './db.js';
import { User } from '../models/User.js';
import 'dotenv/config';

// await User.create({ name: 'Alice', email: 'alice@example.com' });

const apiKey = process.env.HUGGINGFACE_TOKEN; // Hugging Face API-ключ
const API_KEY_BOT = process.env.TELEGRAM_TOKEN; // Telegram bot API key\

const userStates = new Map();
const userData = new Map();

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
  ctx.reply('Меню опций:', Markup.inlineKeyboard([
    [Markup.button.callback('Создать аккаунт', 'createAcc')],
    [Markup.button.callback('Войти в аккаунт', 'loginAcc')]
  ]));
});

bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const userName = ctx.from.first_name;
    const chatId = ctx.chat.id;

    const inputText = ctx.message.text;
    const state = userStates.get(userId);

    switch (state) {
      case 'registrationProcess':
        const phoneRegexp = /^89\d{9}$/;
        const passwordRegexp = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/;
        let sendMessage = undefined;

        userStates.set('registrationSessionTimeout', setTimeout(() => {
          userStates.delete(ctx.from.id);
          ctx.reply('Сессия создания аккаунта - закончена');
        }, 10000))

        if (phoneRegexp.test(inputText) && !userData.has("number")) {
          //detection: if user laready had account with input number
          const user = await User.findOne({ phone: inputText });
          if (user) {
            userStates.delete(userId); 
            await ctx.reply(`Аккаунт с таким номером уже был создан`);
            return;
          }

          userData.set("number", inputText);

          sendMessage = await ctx.reply(`Спасибо! Мы записали ваш номер: ${userData.get("number")}`);

          setTimeout(async () => {
            await ctx.telegram.editMessageText(
              chatId,
              sendMessage.message_id,
              null,
              'Создайте пароль, который содержит:\n 1. Только латинские буквы, \n 2. Минимум 1 цифру \n 3. Минимум одну заглавную букву'
            );
            return;
          }, 1000);
        }

        if (passwordRegexp.test(inputText) && userData.has("number")) {
          userData.set("password", inputText);

          sendMessage = await ctx.reply(`Спасибо! Мы записали ваш пароль: ${userData.get("password")}`);

          setTimeout(async () => {
            await User.create({ phone: userData.get("number"), password: userData.get("password"), name: userName});
            await ctx.telegram.editMessageText(
              chatId,
              sendMessage.message_id,
              null,
              `Ваш аккаунт:\n 1. Номер - ${userData.get("number")}, \n 2. Пароль - ${userData.get("password")}`
            );

            userStates.delete(userId); // очистить состояние
          }, 1000);
        }

        ctx.reply('Завершить регистрацию?', Markup.inlineKeyboard([
          [Markup.button.callback('Да', 'exitRegistration')]
        ]));

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
    const state = userStates.get(ctx.from.id);
    if (state == 'registrationProcess') return;

    userStates.set(ctx.from.id, 'registrationProcess');
    userStates.set('registrationSessionTimeout', setTimeout(() => {
      userStates.delete(ctx.from.id);
      ctx.reply('Сессия создания аккаунта - закончена');
    }, 10000))

    ctx.reply('Создание аккаунта...');
    ctx.reply('Пришлите свой номер телефона в формате: 89XXXXXXXXX');
  });
  bot.action('loginAcc', ctx => ctx.reply('You chose option 2'));
  bot.action('exitRegistration', ctx => userStates.delete(ctx.from.id));

  // Start the bot using long polling
  bot.launch().then(() => {
    console.log('🤖 Bot is up and running!');
  });
  
  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));