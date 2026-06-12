require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
const StorageService = require('./src/services/storageService');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/behold_aspire';

// Cache MongoDB connection for Vercel serverless (reuse across invocations)
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  console.log('[Database] Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  isConnected = true;
  console.log('[Database] MongoDB Connected successfully.');
  await StorageService.seedDefaultAdmin();
}

// On Vercel (serverless), module.exports = app is required.
// For local dev with node/nodemon, we call app.listen().
if (process.env.VERCEL) {
  // Vercel serverless — connect on each cold start, export app
  connectDB().catch(err => {
    console.error('[Database] Failed to connect to MongoDB:', err.message);
  });
  module.exports = app;
} else {
  // Local development — connect then start listening
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`[Server] Behold Aspire backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      });
    })
    .catch(err => {
      console.error('[Database] Failed to connect to MongoDB:', err.message);
      process.exit(1);
    });
}
