// **Роль**:
// - Инкапсулирует операции с базой данных.
// - Централизует хеширование паролей.

import bcrypt from 'bcrypt';
import { User } from '../models/User.js';

export async function findUserByPhone(phone) {
  return await User.findOne({ phone });
}

export async function createUser({ phone, password, name }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await User.create({ phone, password: hashedPassword, name });
}
