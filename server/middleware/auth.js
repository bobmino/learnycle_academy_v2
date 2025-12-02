const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes - verify JWT access token
 */
const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies
  if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret_key');

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

/**
 * Middleware to check user role
 * @param  {...any} roles - Allowed roles
 */
const roleRequired = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }

    next();
  };
};

module.exports = { protect, roleRequired };
