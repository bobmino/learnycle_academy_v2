const User = require('../models/User');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Get current user profile
 * @route   GET /api/profile/me
 * @access  Private
 */
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('groupId', 'name description');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/profile/me
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update user preferences
 * @route   PUT /api/profile/preferences
 * @access  Private
 */
const updatePreferences = async (req, res) => {
  try {
    const { moduleDisplayMode, notificationSettings } = req.body;

    const user = await User.findById(req.user._id);

    if (moduleDisplayMode) {
      if (['list', 'assigned'].includes(moduleDisplayMode)) {
        user.preferences.moduleDisplayMode = moduleDisplayMode;
      } else {
        return res.status(400).json({ message: 'Invalid moduleDisplayMode' });
      }
    }

    if (notificationSettings) {
      if (notificationSettings.email !== undefined) {
        user.preferences.notificationSettings.email = notificationSettings.email;
      }
      if (notificationSettings.push !== undefined) {
        user.preferences.notificationSettings.push = notificationSettings.push;
      }
    }

    await user.save();

    res.json(user.preferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Upload avatar
 * @route   POST /api/profile/avatar
 * @access  Private
 */
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Save new avatar path (handle both local and Vercel)
    const isVercel = process.env.VERCEL === '1' || req.file.path.includes('/tmp/');
    user.avatar = isVercel 
      ? `/tmp/uploads/avatars/${req.file.filename}`
      : `/docs/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({ avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/profile/password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  updatePreferences,
  uploadAvatar,
  changePassword
};

