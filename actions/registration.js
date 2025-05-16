// **Роль**:
// - Изолирует действия, связанные с регистрацией.
// - Использует глобальный `USER_SESSIONS`.

import { REGISTRATION_STEPS, SESSION_TIMEOUT } from '../config.js';
import { getExitButton } from '../utils/telegram.js';
import { handleSessionEnd } from '../utils/session.js';
import { USER_SESSIONS } from '../utils/sessionStore.js';

export async function startRegistration(ctx) {
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;

  const session = USER_SESSIONS.get(userId);
  if (session && session.state === 'registrationProcess') return;

  USER_SESSIONS.set(userId, {
    state: 'registrationProcess',
    step: REGISTRATION_STEPS.AWAITING_PHONE,
    data: { chatId }, // Сохраняем chatId
    timeout: setTimeout(() => {
      const chatId = USER_SESSIONS.get(userId)?.data.chatId;
      if (chatId) {
        ctx.telegram.sendMessage(chatId, 'Сессия регистрации истекла.');
      }
      USER_SESSIONS.delete(userId);
    }, SESSION_TIMEOUT),
  });

  await ctx.reply('Введите номер телефона в формате: 89ХХХХХХХХХ', getExitButton());
}

export function endRegistration(ctx) {
  handleSessionEnd(ctx);
  ctx.reply('Регистрация отменена.');
}