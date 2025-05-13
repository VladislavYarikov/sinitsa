import { Telegraf } from 'telegraf';
import { Markup } from 'telegraf';
import { InferenceClient } from "@huggingface/inference";
import { connectDB } from './db.js';
import { User } from '../models/User.js';
import 'dotenv/config';

const apiKey = process.env.HUGGINGFACE_TOKEN; // Hugging Face API-ключ
const API_KEY_BOT = process.env.TELEGRAM_TOKEN; // Telegram bot API key

const userSessions = new Map(); // Хранит состояние и данные пользователя

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
    
    return chatCompletion.choices[0].message.content;
}

const client = new InferenceClient(apiKey); // client for AI messages
const bot = new Telegraf(API_KEY_BOT);

// Обработчик для процесса регистрации
const registrationHandler = {
  canHandle(ctx) {
    return userSessions.has(ctx.from.id) && userSessions.get(ctx.from.id).state === 'registrationProcess';
  },
  async handle(ctx) {
    const userId = ctx.from.id;
    const userName = ctx.from.first_name;
    const chatId = ctx.chat.id;
    const inputText = ctx.message.text;
    const session = userSessions.get(userId);
    const phoneRegexp = /^89\d{9}$/;
    const passwordRegexp = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/;
    let sendMessage;

    // Обновляем таймер сессии
    resetSessionTimeout(userId, ctx);

    if (phoneRegexp.test(inputText) && !session.data.number) {
      // Проверяем, существует ли пользователь с таким номером
      const user = await User.findOne({ phone: inputText });
      if (user) {
        userSessions.delete(userId);
        await ctx.reply(`Аккаунт с таким номером уже был создан`);
        return true;
      }

      session.data.number = inputText;

      sendMessage = await ctx.reply(`Спасибо! Мы записали ваш номер: ${session.data.number}`, getExitButton());

      setTimeout(async () => {
        await ctx.telegram.editMessageText(
          chatId,
          sendMessage.message_id,
          null,
          'Создайте пароль, который содержит:\n 1. Только латинские буквы, \n 2. Минимум 1 цифру \n 3. Минимум одну заглавную букву',
          getExitButton()
        );
      }, 1000);
    }

    if (passwordRegexp.test(inputText) && session.data.number) {
      session.data.password = inputText;

      sendMessage = await ctx.reply(`Спасибо! Мы записали ваш пароль: ${session.data.password}`, getExitButton());

      setTimeout(async () => {
        await User.create({ phone: session.data.number, password: session.data.password, name: userName });
        await ctx.telegram.editMessageText(
          chatId,
          sendMessage.message_id,
          null,
          `Ваш аккаунт:\n 1. Номер - ${session.data.number}, \n 2. Пароль - ${session.data.password}`
        );

        userSessions.delete(userId); // Очистить состояние
      }, 1000);
    }

    await ctx.reply('Завершить регистрацию?', getExitButton());
    return true;
  },
};

// Обработчик для обычных сообщений
const defaultHandler = {
  canHandle() {
    return true; // Обрабатывает все сообщения, если другие обработчики не применимы
  },
  async handle(ctx) {
    const chatId = ctx.chat.id;
    const inputText = ctx.message.text;

    const sentMessage = await ctx.reply('Подожди...');

    try {
      const response = await generateAnswer(inputText);

      // Редактируем исходное сообщение с ответом
      await ctx.telegram.editMessageText(
        chatId,
        sentMessage.message_id,
        null,
        response
      );
    } catch (error) {
      console.error('Error generating answer:', error);
      await ctx.telegram.editMessageText(
        chatId,
        sentMessage.message_id,
        null,
        'Произошла ошибка при генерации ответа.'
      );
    }
    return true;
  },
};

// Список обработчиков
const messageHandlers = [registrationHandler, defaultHandler];

await connectDB();

bot.start((ctx) => {
  console.log('Start command received');
  ctx.reply('Меню опций:', Markup.inlineKeyboard([
    [Markup.button.callback('Создать аккаунт', 'createAcc')],
    [Markup.button.callback('Войти в аккаунт', 'loginAcc')]
  ]));
});

// Основной обработчик сообщений
bot.on('message', async (ctx) => {
  for (const handler of messageHandlers) {
    if (handler.canHandle(ctx)) {
      await handler.handle(ctx);
      break;
    }
  }
});

bot.action('createAcc', ctx => {
  const userId = ctx.from.id;
  const session = userSessions.get(userId);
  if (session && session.state === 'registrationProcess') return;

  userSessions.set(userId, {
    state: 'registrationProcess',
    data: {},
    timeout: setTimeout(() => {
      userSessions.delete(userId);
      ctx.reply('Сессия создания аккаунта - закончена');
    }, 10000),
  });

  ctx.reply('Создание аккаунта...');
  ctx.reply('Пришлите свой номер телефона в формате: 89XXXXXXXXX', getExitButton());
});

bot.action('loginAcc', ctx => ctx.reply('You chose option 2'));

bot.action('exitRegistration', ctx => {
  userSessions.delete(ctx.from.id);
  ctx.reply('Регистрация отменена.');
});

// Функция для получения кнопки завершения
function getExitButton() {
  return Markup.inlineKeyboard([[Markup.button.callback('Завершить регистрацию', 'exitRegistration')]]);
}

// Функция для обновления таймера сессии
function resetSessionTimeout(userId, ctx) {
  const session = userSessions.get(userId);
  if (session) {
    clearTimeout(session.timeout);
    session.timeout = setTimeout(() => {
      userSessions.delete(userId);
      ctx.reply('Сессия создания аккаунта - закончена');
    }, 10000);
  }
}

// Start the bot using long polling
if (!process.env.DEV)
{
  bot.launch().then(() => {
    console.log('🤖 Bot is up and running!');
  });
}
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));