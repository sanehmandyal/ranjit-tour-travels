import mongoose from 'mongoose';
import { autoSeedIfNeeded } from '../seed/seed.js';

let cachedPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  if (!cachedPromise) {
    mongoose.set('bufferCommands', false);
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ranjit_travels';
    cachedPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    }).then(conn => {
      console.log(`[MongoDB Connected]: ${conn.connection.host}`);
      autoSeedIfNeeded().catch(e => console.error('[Auto-Seed Async Error]:', e.message));
      return conn;
    }).catch(error => {
      cachedPromise = null;
      console.warn(`[MongoDB Connection Warning]: ${error.message} - Running in high-resilience localStore mode.`);
    });
  }
  return cachedPromise;
};
