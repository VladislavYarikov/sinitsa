// **Роль**:
// - Изолирует логику обработки обычных сообщений.
// - Зависит от `generateAnswer` из сервиса AI.

import { generateAnswer } from '../services/ai.js';
import { USER_SESSIONS } from '../utils/sessionStore.js';

export const defaultHandler = {
  canHandle(ctx) {
    const session = USER_SESSIONS.get(ctx.from.id);
    const isValid = session === undefined;
    console.log(`canHandle message applying for user ${ctx.from.id}: ${isValid}`);
    return isValid;
  },
  async handle(ctx) {
    const chatId = ctx.chat.id;
    const inputText = ctx.message.text;

    const sentMessage = await ctx.reply('Печатаю...');

    try {
      const response = await generateAnswer(inputText);
      await ctx.telegram.editMessageText(chatId, sentMessage.message_id, null, response);
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