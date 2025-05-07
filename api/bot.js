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
const bot = new Telegraf(API_KEY_BOT);


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

// bot.on('message:text', async (ctx) => {
//     const chatId = ctx.chat.id;
//     const inputText = ctx.message.text;
  
//     // Send placeholder message
//     const sentMessage = await ctx.reply('Подожди...');
  
//     try {
//       const response = await generateAnswer(inputText);
  
//       // Edit the original message with the response
//       await ctx.telegram.editMessageText(
//         chatId,
//         sentMessage.message_id,
//         null,
//         response
//       );
//     } catch (error) {
//       console.error('Error generating answer:', error);
//       await ctx.reply('Произошла ошибка при генерации ответа.');
//     }
//   });

bot.on('message:text', async (ctx) => {
    console.log(ctx);
    ctx.reply('Подожди...');
});
  
// Start the bot using long polling
bot.launch().then(() => {
    console.log('🤖 Bot is up and running!');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));  