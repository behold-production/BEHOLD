const app = require('../backend/src/app');
const { connectDB } = require('../backend/src/config/db');
const url = require('url');

module.exports = async (req, res) => {
  // Ultra-fast handler for Meta Webhook GET verification
  if (req.method === 'GET' && req.url && req.url.includes('/whatsapp/webhook')) {
    const parsedUrl = url.parse(req.url, true);
    const challenge = parsedUrl.query['hub.challenge'] || parsedUrl.query.challenge || '12345';
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 200;
    return res.end(String(challenge));
  }

  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless] DB Connection Error:', err.message);
  }
  return app(req, res);
};
