// import TelegramBot from 'node-telegram-bot-api';
// import { InferenceClient } from "@huggingface/inference";
// import 'dotenv/config';

// const apiKey = process.env.HUGGINGFACE_TOKEN; // Hugging Face API-ключ
// const API_KEY_BOT = process.env.TELEGRAM_TOKEN; // Telegram bot API key

// const generateAnswer = async (message) => {
//     const chatCompletion = await client.chatCompletion({
//         provider: "novita",
//         model: "deepseek-ai/DeepSeek-V3-0324",
//         messages: [
//             {
//                 role: "user",
//                 content: `Я предоставлю тебе сейчас запрос от пользователя моего чат-бота. Твоя задача: ответить на сообщение пользователя в роли - пивного быдла, который не знает манер. Сообщение пользователя: ${message}`,
//             },
//         ],
//     });
    
//     return chatCompletion.choices[0].message.content
// }

// const client = new InferenceClient(apiKey); //client for AI messages
// const bot = new TelegramBot(API_KEY_BOT, { polling: false });

// bot.on("polling_error", err => console.log(err.data.error.message));

// bot.on("text", (msg) => {
//     const chatId = msg.chat.id;
    
//     bot.sendMessage(chatId, 'Подожди...')
//        .then(sentMessage => { generateAnswer(msg.text)
//        .then(response => {
//                 bot.editMessageText(response, {
//                 chat_id: chatId,
//                 message_id: sentMessage.message_id
//             });
//         });
//     });
// });

// export default async function handler(req, res) {
//     if (req.method === 'POST') {
//       try {
//         // Process the update from the request body
//         await bot.processUpdate(req.body); // <-- Fixed to use processUpdate
//         res.status(200).send('ok');
//       } catch (error) {
//         res.status(500).send('Error processing update');
//         console.error('Error:', error);
//       }
//     } else {
//       res.status(200).send('Bot is running');
//     }
// }
  

import TelegramBot from 'node-telegram-bot-api';

// Create a bot instance using your Telegram token
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Simple 'ping' command for testing
  if (text.toLowerCase() === 'ping') {
    bot.sendMessage(chatId, 'pong');
  }
});

// Define the webhook handler
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Process the update from the request body
      await bot.processUpdate(req.body); // <-- Fixed to use processUpdate
      res.status(200).send('ok');
    } catch (error) {
      res.status(500).send('Error processing update');
      console.error('Error:', error);
    }
  } else {
    res.status(200).send('Bot is running');
  }
}
