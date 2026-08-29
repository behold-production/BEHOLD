const path = require('path');
require('dotenv').config();
try { require('dotenv').config({ path: path.resolve(process.cwd(), '.env') }); } catch {}
try { require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); } catch {}
try { require('dotenv').config({ path: path.resolve(__dirname, '../../../backend/.env') }); } catch {}

const mongoose = require('mongoose');
const StorageService = require('../services/storageService');

// Allow Mongoose command buffering during serverless cold starts
mongoose.set('bufferCommands', true);

let isConnected = false;
let dbPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2 && dbPromise) {
    return dbPromise;
  }

  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGO_URI || process.env.MONGO_URL;
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
    .then((mongooseInstance) => {
      isConnected = true;
      console.log('[Database] MongoDB Connected successfully.');
      // Seed default admin in background without blocking response
      StorageService.seedDefaultAdmin().catch((seedErr) => {
        console.error('[Database] Failed to seed default admin:', seedErr.message);
      });
      return mongooseInstance.connection;
    })
    .catch((err) => {
      console.error('[Database] MongoDB connection error:', err);
      dbPromise = null;
      isConnected = false;
      throw new Error('Database connection error. Please verify database connectivity.');
    });

  return dbPromise;
}

module.exports = { connectDB };
