// **Роль**:
// - Завершает любой процесс (регистрацию или викторину).
// - Вызывает `handleSessionEnd` для очистки сессии.

import { handleSessionEnd } from '../utils/session.js';

export function endProcess(ctx) {
  handleSessionEnd(ctx);
  ctx.reply('Процесс завершён.');
}