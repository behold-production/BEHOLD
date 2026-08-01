const app = require('../backend/src/app');
const { connectDB } = require('../backend/src/config/db');

module.exports = async (req, res) => {
  // Fast-path for GET webhook verification requests to avoid serverless cold-start DB delays
  if (req.method === 'GET' && req.url && req.url.includes('/whatsapp/webhook')) {
    return app(req, res);
  }

  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless] DB Connection Error:', err.message);
  }
  return app(req, res);
};
