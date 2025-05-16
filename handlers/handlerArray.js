// **Роль**:
// - Централизованный экспорт массива обработчиков.
// - Упрощает добавление новых обработчиков в будущем.

import { registrationHandler } from './registrationHandler.js';
import { defaultHandler } from './defaultHandler.js';
import { quizHandler } from './quizHandler.js';

export const messageHandlers = [registrationHandler, defaultHandler];

export const actionHandlers = [quizHandler];