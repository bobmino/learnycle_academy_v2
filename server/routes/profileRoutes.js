const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const uploadAvatar = require('../middleware/avatarUpload');
const {
  getMyProfile,
  updateProfile,
  updatePreferences,
  uploadAvatar: uploadAvatarHandler,
  changePassword
} = require('../controllers/profileController');

// All routes require authentication
router.use(protect);

// Get my profile
router.get('/me', getMyProfile);

// Update profile
router.put('/me', updateProfile);

// Update preferences
router.put('/preferences', updatePreferences);

// Upload avatar
router.post('/avatar', uploadAvatar.single('avatar'), uploadAvatarHandler);

// Change password
router.put('/password', changePassword);

module.exports = router;

