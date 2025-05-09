import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
}, { collection: 'clients' });

export const User = mongoose.model('User', userSchema);
