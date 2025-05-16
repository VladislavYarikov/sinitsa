import { USER_SESSIONS } from '../utils/sessionStore.js';
import { getExitButton } from '../utils/telegram.js';
import { SESSION_TIMEOUT } from '../config.js';
import { QUIZ_QUESTIONS } from '../config.js';

export async function startQuiz(ctx) {
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;

  const session = USER_SESSIONS.get(userId);
  if (session && session.state === 'quizProcess') return;

  USER_SESSIONS.set(userId, {
    state: 'quizProcess',
    step: 'question_1',
    data: { chatId }, // Сохраняем chatId
    timeout: setTimeout(() => {
      USER_SESSIONS.delete(userId);
      ctx.reply('Викторина истекла, братан.');
    }, SESSION_TIMEOUT),
  });

  await ctx.reply('Начинаем викторину: Какой ты сорт пива?', getExitButton());
  await sendQuestion(ctx, 'question_1', ctx.chat.id);
}

export async function sendQuestion(ctx, step, chatId) {
  const question = QUIZ_QUESTIONS.find(q => q.id === step);
  await ctx.telegram.sendPoll(
    chatId, // Используем ctx.chat.id для первого вопроса
    question.text,
    question.options,
    { is_anonymous: false, allows_multiple_answers: false }
  );
}