import mongoose from 'mongoose';
import { autoSeedIfNeeded } from '../seed/seed.js';

export const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ranjit_travels', {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    // Auto initialize production database if empty
    autoSeedIfNeeded().catch(e => console.error('[Auto-Seed Async Error]:', e.message));
  } catch (error) {
    console.warn(`[MongoDB Connection Warning]: ${error.message} - Running in high-resilience localStore mode.`);
  }
};
