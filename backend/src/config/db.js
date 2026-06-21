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
      connectTimeoutMS: 15000,
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
      dbPromise = null; // Reset promise so retry can be attempted on next request
      isConnected = false;
      console.error('[Database] Failed to connect to MongoDB:', err.message);
      throw err;
    });

  return dbPromise;
}

module.exports = { connectDB };
