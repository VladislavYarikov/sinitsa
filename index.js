import TelegramBot from 'node-telegram-bot-api';
import { InferenceClient } from "@huggingface/inference";

const apiKey = ''; // Hugging Face API-ключ
const API_KEY_BOT = ''; // Telegram bot API key

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

// console.log(chatCompletion.choices[0].message);

const client = new InferenceClient(apiKey); //client for AI messages
const bot = new TelegramBot(API_KEY_BOT, {  //bot for Telegram
    polling: {
      interval: 300,
      autoStart: true
    }  
});

bot.on("polling_error", err => console.log(err.data.error.message));

bot.on("text", (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, 'Подожди...')
       .then(sentMessage => { generateAnswer(msg.text)
       .then(response => {
                bot.editMessageText(response, {
                chat_id: chatId,
                message_id: sentMessage.message_id
            });
        });
    });
});