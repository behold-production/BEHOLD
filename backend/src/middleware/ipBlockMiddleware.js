/**
 * ipBlockMiddleware.js
 * Checks each incoming request's IP against the blockedIps list in Settings.
 * Uses a short in-memory cache (30 s) to avoid hitting the database on every request.
 */
const Setting = require('../models/Setting');

let _cachedBlockedIps = [];
let _lastFetched = 0;
const CACHE_TTL_MS = 30_000; // 30 seconds

async function refreshCache() {
  try {
    const settings = await Setting.findOne({ id: 'global' }).lean();
    _cachedBlockedIps = settings?.blockedIps ?? [];
    _lastFetched = Date.now();
  } catch (_) {
    // On DB error, keep the previous cache
  }
}

async function ipBlockMiddleware(req, res, next) {
  // Refresh cache if stale
  if (Date.now() - _lastFetched > CACHE_TTL_MS) {
    await refreshCache();
  }

  if (_cachedBlockedIps.length === 0) return next();

  // Extract real IP (support proxies)
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    '';

  if (_cachedBlockedIps.includes(ip)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Your IP address has been blocked.'
    });
  }

  next();
}

/** Call this after a Settings update to immediately invalidate the cache */
function invalidateIpCache() {
  _lastFetched = 0;
}

module.exports = { ipBlockMiddleware, invalidateIpCache };
