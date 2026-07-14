const mongoose = require('mongoose');
const StorageService = require('../services/storageService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/behold_aspire';

let isConnected = false;
let dbPromise = null;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (dbPromise) {
    return dbPromise;
  }

  console.log('[Database] Connecting to MongoDB...');

  dbPromise = mongoose
    .connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000
    })
    .then(async (mongooseInstance) => {
      isConnected = true;
      console.log('[Database] MongoDB Connected successfully.');
      try {
        await StorageService.seedDefaultAdmin();
      } catch (seedErr) {
        console.error('[Database] Failed to seed default admin:', seedErr.message);
      }
      return mongooseInstance.connection;
    })
    .catch((err) => {
      console.error('[Database] MongoDB connection error:', err);
      dbPromise = null;
      if (!process.env.MONGODB_URI) {
        throw new Error('Database connection error. VERCEL ENVIRONMENT VARIABLE MISSING: You must add MONGODB_URI in your Vercel Dashboard Settings -> Environment Variables.');
      }
      throw new Error('Database connection error. MONGODB ATLAS BLOCKED: You must go to MongoDB Atlas -> Network Access and add IP 0.0.0.0/0 to allow Vercel to connect.');
    });

  return dbPromise;
}

module.exports = { connectDB };
