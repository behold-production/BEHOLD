const NodeCache = require('node-cache');

// stdTTL is the default time to live in seconds
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

/**
 * Express middleware to cache responses in memory.
 * @param {number} duration - Cache duration in seconds (optional, defaults to 300).
 */
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Construct a unique cache key based on the URL and query parameters
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      res.set('Content-Type', 'application/json');
      return res.send(cachedResponse);
    } else {
      // Intercept the res.send method to cache the response before sending it
      const originalSend = res.send;
      res.send = (body) => {
        // Only cache successful JSON responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(key, body, duration);
        }
        originalSend.call(res, body);
      };
      next();
    }
  };
};

module.exports = { cacheMiddleware, cache };
