import { generateAnswer } from '../services/ai.js';
import { USER_SESSIONS } from '../utils/sessionStore.js';
import { resetSessionTimeout, handleSessionEnd } from '../utils/session.js';
import { getExitButton } from '../utils/telegram.js';
import { QUIZ_STEPS } from '../config.js';
import { QUIZ_QUESTIONS } from '../config.js';
import { sendQuestion } from '../actions/quiz.js';

export const quizHandler = {
  canHandle(ctx) {
    const session = USER_SESSIONS.get(ctx.from.id);
    const isValid = session && session.state === 'quizProcess' && Object.values(QUIZ_STEPS).includes(session.step);
    console.log(`canHandle quiz for user ${ctx.from.id}: ${isValid}`);
    return isValid;
  },
  async handle(ctx) {
    const userId = ctx.from.id;
    const session = USER_SESSIONS.get(userId);

    console.log(`Handling quiz step ${session.step} for user ${userId}`);

    // Обработка ответа на опрос
    if (ctx.pollAnswer) {
      const pollAnswer = ctx.pollAnswer;
      const question = QUIZ_QUESTIONS.find(q => q.id === session.step);
      const answerIndex = pollAnswer.option_ids[0];
      session.data.answers = session.data.answers || {};
      session.data.answers[session.step] = question.options[answerIndex];

      // Переходим к следующему вопросу или завершаем
      const currentQuestionIndex = QUIZ_QUESTIONS.findIndex(q => q.id === session.step);
      if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
        session.step = QUIZ_QUESTIONS[currentQuestionIndex + 1].id;
        resetSessionTimeout(userId, ctx);
        await sendQuestion(ctx, session.step, session.data.chatId);
      } else {
        session.step = QUIZ_STEPS.COMPLETED;
        await handleQuizCompletion(ctx, session.data.chatId);
      }
    }

    return true;
  },
};

function formatQuizPrompt(answers) {
  const formattedAnswers = QUIZ_QUESTIONS.map((question, index) => {
    const answer = answers[question.id] || 'Не отвечено';
    return `${index + 1}. ${question.text}: ${answer}`;
  }).join('\n');

  return `
🎯 Ответы пользователя на пивную викторину:
${formattedAnswers}
🍺 На основе этих ответов определи, какой сорт пива подходит пользователю одним словом. 
  `.trim();
}

async function handleQuizCompletion(ctx, chatId) {
  const userId = ctx.from.id;
  const session = USER_SESSIONS.get(userId);
  const answers = session.data.answers;

  const prompt = formatQuizPrompt(answers);
  try {
    const result = await generateAnswer(prompt);
    await ctx.telegram.sendMessage(chatId, result, getExitButton());
  } catch (error) {
    console.error('Error generating quiz result:', error);
    await ctx.telegram.sendMessage(chatId, 'Чёт сломалось, братан. Попробуй ещё раз.', getExitButton());
  }

  handleSessionEnd(ctx);
}