require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
const StorageService = require('./src/services/storageService');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/behold_aspire';

console.log('[Database] Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('[Database] MongoDB Connected successfully.');
    
    // Seed system admin
    await StorageService.seedDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`[Server] Behold Aspire backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  })
  .catch(err => {
    console.error('[Database] Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
