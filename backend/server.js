require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 5001;

// Export the app for serverless environments (Vercel)
module.exports = app;

// Local development — connect then start listening only if executed directly
if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(
          `[Server] Behold Aspire backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`
        );
      });
    })
    .catch((err) => {
      console.error('[Database] Failed to connect to MongoDB:', err.message);
      process.exit(1);
    });
} else {
  // For Vercel cold starts, initialize DB connection
  connectDB().catch((err) => {
    console.error('[Database] Failed to connect to MongoDB on cold start:', err.message);
  });
}
