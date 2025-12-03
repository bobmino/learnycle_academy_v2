const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide name, email, and password' 
      });
    }

    // Check MongoDB connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database not connected. Please try again in a moment.' 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student'
    });

    if (user) {
      // Generate tokens
      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);

      // Set tokens in httpOnly cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    // Provide more detailed error information
    const errorMessage = error.message || 'Internal server error';
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    
    res.status(statusCode).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.error(`Login failed: User not found for email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.error(`Login failed: Invalid password for email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`Login successful for user: ${email}, role: ${user.role}`);

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Set tokens in httpOnly cookies
    // In production (Vercel), use 'none' for sameSite to allow cross-origin cookies
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // HTTPS required in production
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin in production
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    };

    res.cookie('accessToken', accessToken, cookieOptions);

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    // Clear cookies
    const isProduction = process.env.NODE_ENV === 'production';
    const clearCookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      expires: new Date(0),
      path: '/'
    };

    res.cookie('accessToken', '', clearCookieOptions);
    res.cookie('refreshToken', '', clearCookieOptions);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh_secret_key'
    );

    // Get user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id, user.role);

    // Set new access token
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/'
    });

    res.json({ message: 'Token refreshed' });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create admin user if doesn't exist (for initial setup)
 * @route   POST /api/auth/create-admin
 * @access  Public (only if no admin exists)
 */
const createAdmin = async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      return res.status(400).json({ 
        message: 'Admin user already exists',
        email: existingAdmin.email 
      });
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@learncycle.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('Admin user created:', admin.email);

    res.status(201).json({
      message: 'Admin user created successfully',
      email: admin.email,
      password: 'admin123',
      note: 'Please change the password after first login'
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create teacher user
 * @route   POST /api/auth/create-teacher
 * @access  Public (for initial setup)
 */
const createTeacher = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected. Please try again in a moment.' });
    }

    const existingTeacher = await User.findOne({ email: 'teacher@learncycle.com' });
    if (existingTeacher) {
      return res.status(409).json({ 
        message: 'Teacher user already exists.',
        credentials: {
          email: 'teacher@learncycle.com',
          password: 'teacher123'
        }
      });
    }

    const teacherUser = await User.create({
      name: 'Teacher User',
      email: 'teacher@learncycle.com',
      password: 'teacher123', // This will be hashed by pre-save hook
      role: 'teacher'
    });

    res.status(201).json({
      message: 'Teacher user created successfully',
      user: {
        _id: teacherUser._id,
        name: teacherUser.name,
        email: teacherUser.email,
        role: teacherUser.role
      },
      credentials: {
        email: 'teacher@learncycle.com',
        password: 'teacher123',
        note: 'Please change the password after first login!'
      }
    });
  } catch (error) {
    console.error('Error creating teacher user:', error);
    res.status(500).json({ message: 'Failed to create teacher user', error: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  createAdmin,
  createTeacher
};
