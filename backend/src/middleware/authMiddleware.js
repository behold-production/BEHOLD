const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
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
    req.user = decoded; // { id, email, role }
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
  requireRole
};
