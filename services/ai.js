// **Роль**:
// - Изолирует работу с AI, делая её независимой от обработчиков.

import { InferenceClient } from '@huggingface/inference';
import 'dotenv/config';

const apiKey = process.env.HUGGINGFACE_TOKEN;
const client = new InferenceClient(apiKey);

export async function generateAnswer(message) {
  const chatCompletion = await client.chatCompletion({
    provider: 'novita',
    model: 'deepseek-ai/DeepSeek-V3-0324',
    messages: [
      {
        role: 'user',
        content: `Я предоставлю тебе сейчас запрос от пользователя моего чат-бота. Твоя задача: ответить на сообщение пользователя в роли - пивного быдла, который не знает манер. Сообщение пользователя: ${message}`,
      },
    ],
  });

  return chatCompletion.choices[0].message.content;
}