export const REGISTRATION_STEPS = {
  AWAITING_PHONE: 'awaiting_phone',
  AWAITING_PASSWORD: 'awaiting_password',
  COMPLETED: 'completed',
};

export const QUIZ_STEPS = {
  QUESTION_1: 'question_1',
  QUESTION_2: 'question_2',
  QUESTION_3: 'question_3',
  COMPLETED: 'completed',
};

export const QUIZ_QUESTIONS = [
  {
    id: 'question_1',
    text: 'Какой вкус ты предпочитаешь в пиве?',
    options: ['Горький', 'Сладкий', 'Кислый', 'Нейтральный'],
  },
  {
    id: 'question_2',
    text: 'Какой крепости пиво тебе по душе?',
    options: ['Лёгкое (до 4%)', 'Среднее (4-6%)', 'Крепкое (6-8%)', 'Очень крепкое (8%+)'],
  },
  {
    id: 'question_3',
    text: 'Где ты обычно пьёшь пиво?',
    options: ['Дома', 'В баре', 'На природе', 'На вечеринке'],
  },
];

export const SESSION_TIMEOUT = 20000;
export const MESSAGE_TIMEOUT = 1500;

export const PHONE_REGEXP = /^89\d{9}$/;
export const PASSWORD_REGEXP = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/;