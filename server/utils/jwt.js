const jwt = require('jsonwebtoken');

// Generate JWT Access Token
const generateAccessToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_ACCESS_SECRET || 'access_secret_key',
    { expiresIn: '15m' } // Short-lived access token
  );
};

// Generate JWT Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
    { expiresIn: '7d' } // Long-lived refresh token
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};
