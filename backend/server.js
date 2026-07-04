require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 5001;

// On Vercel (serverless), module.exports = app is required.
// For local dev with node/nodemon, we call app.listen().
if (process.env.VERCEL) {
  // Vercel serverless — connect on each cold start, export app
  connectDB().catch((err) => {
    console.error('[Database] Failed to connect to MongoDB:', err.message);
  });
  module.exports = app;
} else {
  // Local development — connect then start listening
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
}
