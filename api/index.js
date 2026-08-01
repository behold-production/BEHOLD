const app = require('../backend/src/app');
const { connectDB } = require('../backend/src/config/db');
const url = require('url');

module.exports = async (req, res) => {
  // Ultra-fast handler for Meta Webhook GET verification
  if (req.method === 'GET' && req.url && (req.url.includes('whatsapp/webhook') || req.url.includes('hub.challenge'))) {
    const parsedUrl = url.parse(req.url, true);
    let challenge = parsedUrl.query['hub.challenge'] || parsedUrl.query.challenge || (req.query && (req.query['hub.challenge'] || req.query.challenge));

    if (!challenge && req.url) {
      const match = req.url.match(/hub\.challenge=([^&]+)/);
      if (match) {
        challenge = decodeURIComponent(match[1]);
      }
    }

    const finalChallenge = String(challenge || '12345');
    console.log('[Vercel Webhook Verification Echo]:', finalChallenge);

    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 200;
    return res.end(finalChallenge);
  }

  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless] DB Connection Error:', err.message);
  }
  return app(req, res);
};
