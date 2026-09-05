const jwt = require('jsonwebtoken');
const StorageService = require('../services/storageService');

// In-memory cache for fast session token lookups: key = `${role}_${userId}`, val = { sessionToken, timestamp }
const sessionCache = new Map();
const SESSION_CACHE_TTL = 30 * 1000; // 30 seconds local cache for high throughput

const getActiveSessionToken = async (userId, role) => {
  if (!userId) return null;
  const cacheKey = `${role || 'user'}_${userId}`;
  const cached = sessionCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < SESSION_CACHE_TTL) {
    return cached.sessionToken;
  }

  try {
    const table = role === 'admin' ? 'admins' : (role === 'counsellor' || role === 'psychologist' ? 'counsellors' : 'users');
    const user = await StorageService.findById(table, userId);
    if (user && user.sessionToken) {
      sessionCache.set(cacheKey, { sessionToken: user.sessionToken, timestamp: now });
      return user.sessionToken;
    }
  } catch (err) {}
  return null;
};

const updateActiveSessionCache = (userId, role, sessionToken) => {
  if (!userId) return;
  const cacheKey = `${role || 'user'}_${userId}`;
  sessionCache.set(cacheKey, { sessionToken, timestamp: Date.now() });
};

const invalidateSessionCache = (userId, role) => {
  if (!userId) return;
  const cacheKey = `${role || 'user'}_${userId}`;
  sessionCache.delete(cacheKey);
};

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: No Token Provided'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'behold_jwt_secret_key_2026_xyz');
    if (decoded && decoded.role) {
      decoded.role = decoded.role.toLowerCase();
    }

    // Check single-device session token enforcement
    if (decoded && decoded.sessionToken) {
      const activeSession = await getActiveSessionToken(decoded.id, decoded.role);
      if (activeSession && activeSession !== decoded.sessionToken) {
        return res.status(401).json({
          success: false,
          code: 'CONCURRENT_LOGIN_LOGOUT',
          message: 'Your account was signed in on another device. You have been logged out.'
        });
      }
    }

    req.user = decoded; // { id, email, role, sessionToken }
    next();
  } catch (error) {
    console.error('[Auth Middleware] JWT Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access Token Expired'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid Access Token'
    });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Role Unauthorized'
      });
    }

    const userRole = req.user.role.toLowerCase();
    const allowed = allowedRoles.map((r) => r.toLowerCase());
    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Requires one of these roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

const optionalJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'behold_jwt_secret_key_2026_xyz');
    if (decoded && decoded.role) {
      decoded.role = decoded.role.toLowerCase();
    }
    req.user = decoded; // { id, email, role }
  } catch (error) {
    // Proceed as unauthenticated for optional token
  }
  next();
};

module.exports = {
  verifyJWT,
  optionalJWT,
  requireRole,
  updateActiveSessionCache,
  invalidateSessionCache
};
