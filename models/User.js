import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phone: Number,
  password: String,
  name: String,
}, { collection: 'clients' });

export const User = mongoose.model('User', userSchema);
