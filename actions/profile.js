// **Роль**:
// - Показывает подменю для профиля, аналогичное текущему `/start`.

export function profile(ctx) {
    ctx.reply('Управление профилем:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Создать аккаунт', callback_data: 'start_registration' }],
          [{ text: 'Войти в аккаунт', callback_data: 'loginAcc' }],
        ],
      },
    });
  }