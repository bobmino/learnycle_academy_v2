const express = require('express');
const router = express.Router();
const { protect, roleRequired } = require('../middleware/auth');
const { validate, registerSchema, loginSchema } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  createAdmin
} = require('../controllers/authController');

// Public routes
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/create-admin', createAdmin); // Create admin if doesn't exist (setup only)

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
