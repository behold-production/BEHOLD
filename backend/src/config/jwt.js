module.exports = {
  secret: process.env.JWT_SECRET || 'behold_jwt_secret_key_2026_xyz',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'behold_jwt_refresh_secret_key_2026_abc',
  expiresIn: '15m',
  refreshExpiresIn: '7d'
};
