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

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Requires one of these roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  verifyJWT,
  requireRole
};
