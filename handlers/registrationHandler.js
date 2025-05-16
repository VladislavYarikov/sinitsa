// **Роль**:
// - Изолирует логику регистрации.
// - Импортирует зависимости и использует глобальный `USER_SESSIONS`.

import { findUserByPhone, createUser } from '../services/user.js';
import { REGISTRATION_STEPS, PHONE_REGEXP, PASSWORD_REGEXP, MESSAGE_TIMEOUT } from '../config.js';
import { resetSessionTimeout, handleSessionEnd } from '../utils/session.js';
import { getExitButton } from '../utils/telegram.js';
import { USER_SESSIONS } from '../utils/sessionStore.js';

export const registrationHandler = {
  canHandle(ctx) {
    const session = USER_SESSIONS.get(ctx.from.id);
    const isValid = session && session.state === 'registrationProcess' && Object.values(REGISTRATION_STEPS).includes(session.step);
    console.log(`canHandle registration for user ${ctx.from.id}: ${isValid}`);
    return isValid;
  },
  async handle(ctx) {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;
    const inputText = ctx.message.text;
    const messageId = ctx.message.message_id;
    const session = USER_SESSIONS.get(userId);

    console.log(`Handling registration step ${session.step} for user ${userId}`);

    // Убедимся, что chatId сохранён
    session.data.chatId = chatId;
    resetSessionTimeout(userId, ctx);

    switch (session.step) {
      case REGISTRATION_STEPS.AWAITING_PHONE:
        if (!PHONE_REGEXP.test(inputText)) {
          await ctx.reply('Пожалуйста, введите корректный номер телефона в формате: 89ХХХХХХХХХ.', getExitButton());
          try {
            await ctx.telegram.deleteMessage(chatId, messageId);
          } catch (error) {
            console.error('Error deleting invalid phone message:', error);
          }
          return true;
        }

        let existingUser;
        try {
          existingUser = await findUserByPhone(inputText);
        } catch (error) {
          console.error('Error querying user:', error);
          await ctx.reply('Произошла ошибка при проверке номера телефона.');
          handleSessionEnd(ctx);
          return true;
        }
        if (existingUser) {
          handleSessionEnd(ctx);
          await ctx.reply('Аккаунт с таким номером уже существует.');
          return true;
        }

        session.data.phone = inputText;
        session.step = REGISTRATION_STEPS.AWAITING_PASSWORD;

        const phoneMessage = await ctx.reply(`Спасибо! Мы записали ваш номер: ${session.data.phone}`, getExitButton());

        setTimeout(async () => {
          await ctx.telegram.editMessageText(
            chatId,
            phoneMessage.message_id,
            null,
            'Создайте пароль, который содержит:\n1. Только латинские буквы\n2. Минимум 1 цифру\n3. Минимум одну заглавную букву',
            getExitButton()
          );
        }, MESSAGE_TIMEOUT);
        return true;

      case REGISTRATION_STEPS.AWAITING_PASSWORD:
        if (!PASSWORD_REGEXP.test(inputText)) {
          await ctx.reply('Пароль должен содержать латинские буквы, минимум 1 цифру и 1 заглавную букву.', getExitButton());
          try {
            await ctx.telegram.deleteMessage(chatId, messageId);
          } catch (error) {
            console.error('Error deleting invalid password message:', error);
          }
          return true;
        }

        session.data.password = inputText;
        session.step = REGISTRATION_STEPS.COMPLETED;

        const passwordMessage = await ctx.reply(`Спасибо! Мы записали ваш пароль.`, getExitButton());

        setTimeout(async () => {
          await ctx.telegram.editMessageText(
            chatId,
            passwordMessage.message_id,
            null,
            `Ваш аккаунт:\n1. Номер: ${session.data.phone}\n2. Пароль: ***`
          );
        }, MESSAGE_TIMEOUT);
        handleRegistrationCompletion(ctx);
        return true;

      default:
        handleSessionEnd(ctx);
        await ctx.reply('Неизвестное состояние. Попробуйте начать заново.');
        return true;
    }
  },
};

async function handleRegistrationCompletion(ctx) {
  try {
    await createUser({
      phone: session.data.phone,
      password: session.data.password,
      name: ctx.from.first_name,
    });
    handleSessionEnd(ctx);
  } catch (error) {
    console.error('Error creating user:', error);
    await ctx.reply('Произошла ошибка при создании аккаунта.');
    handleSessionEnd(ctx);
  }
}