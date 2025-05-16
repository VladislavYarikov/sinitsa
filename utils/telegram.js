// **Роль**:
// - Изолирует Telegram-специфичные функции, такие как создание кнопок и обработка команды `/start`.

import { Markup } from 'telegraf';

export function getExitButton() {
  return Markup.inlineKeyboard([[Markup.button.callback('Завершить?', 'end_process')]]);
}

export function start(ctx) {
  console.log('Start command received');
  ctx.reply('Меню опций:', Markup.inlineKeyboard([
    [Markup.button.callback('Викторина: Какой ты сорт пива?', 'start_quiz')]
  ]));
}

export function menu(ctx) {
  console.log('Menu command received');
  ctx.reply('Выберите опцию:', Markup.inlineKeyboard([
    [Markup.button.callback('Профиль', 'profile')],
    [Markup.button.callback('Викторина: Какой ты сорт пива?', 'start_quiz')],
  ]));
}