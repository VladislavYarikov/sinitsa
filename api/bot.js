import TelegramBot from 'node-telegram-bot-api';
import { Telegraf } from 'telegraf';
import { InferenceClient } from "@huggingface/inference";
import 'dotenv/config';

const apiKey = process.env.HUGGINGFACE_TOKEN; // Hugging Face API-ключ
const API_KEY_BOT = process.env.TELEGRAM_TOKEN; // Telegram bot API key

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
//const bot = new TelegramBot(API_KEY_BOT, { polling: false });
const bot = new Telegraf(API_KEY_BOT);

// bot.on("polling_error", err => console.log(err.data.error.message));

// bot.on("text", (msg) => {
//     const chatId = msg.chat.id;
//     //console.log(msg)
    
//     bot.sendMessage(chatId, 'Подожди...')
//        .then(sentMessage => { console.log(sentMessage); generateAnswer(msg.text)
//        .then(response => {
//                 bot.editMessageText(response, {
//                 chat_id: chatId,
//                 message_id: sentMessage.message_id
//             });
//         });
//     });
// });
bot.hears('hi', (ctx) => ctx.reply('Hey there'));
bot.on('text', (ctx) => {
    ctx.reply('Hi from Vercel!');
  });
bot.launch();

export default async function handler(req, res) {
    console.log(bot)

  if (req.method === 'POST') {
    try {
      // Process the update from the request body
      await bot.handleUpdate(req.body, res);
      res.status(200).send('ok');
    } catch (error) {
      res.status(500).send('Error processing update');
      console.error('Error:', error);
    }
  } else {
    res.status(200).send('Bot is running');
  }
}
  