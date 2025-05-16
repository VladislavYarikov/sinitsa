// **Роль**:
// - Изолирует логику управления сессиями.
// - Использует глобальный `USER_SESSIONS`.

import { SESSION_TIMEOUT } from '../config.js';
import { USER_SESSIONS } from './sessionStore.js';

export function resetSessionTimeout(userId, ctx) {
  const session = USER_SESSIONS.get(userId);
  if (session) {
    clearTimeout(session.timeout);
    session.timeout = setTimeout(() => {
      const chatId = session.data.chatId;
      if (chatId) {
        ctx.telegram.sendMessage(chatId, 'Сессия истекла.');
      }
      USER_SESSIONS.delete(userId);
    }, SESSION_TIMEOUT);
  }
}

export function handleSessionEnd(ctx) {
  const userId = ctx.from.id;
  const session = USER_SESSIONS.get(userId);
  if (session) {
    clearTimeout(session.timeout);
    USER_SESSIONS.delete(userId);
  }
}