const mongoose = require('mongoose');
const StorageService = require('../services/storageService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/behold_aspire';

// Allow Mongoose command buffering during serverless cold starts
mongoose.set('bufferCommands', true);

let isConnected = false;
let dbPromise = null;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (dbPromise) {
    return dbPromise;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri && process.env.NODE_ENV === 'production') {
    throw new Error("VERCEL ENVIRONMENT VARIABLE 'MONGODB_URI' is missing. Please add MONGODB_URI to Vercel Project Settings.");
  }

  const targetUri = mongoUri || 'mongodb://127.0.0.1:27017/behold_aspire';
  console.log('[Database] Connecting to MongoDB...');

  dbPromise = mongoose
    .connect(targetUri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 20000,
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
      throw new Error('Database connection error. Please verify database connectivity.');
    });

  return dbPromise;
}

module.exports = { connectDB };
