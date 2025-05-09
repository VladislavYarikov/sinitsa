import mongoose from 'mongoose';

const MONGO_URL = process.env.MONGO_URL; // or hardcode your string here

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected with Mongoose');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }
}
