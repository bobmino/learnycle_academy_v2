const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Determine upload directory for avatars
const getAvatarDir = () => {
  const cwd = process.cwd();
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1' || cwd.includes('/var/task');
  
  if (isProduction || isVercel) {
    return '/tmp/uploads/avatars';
  }
  return path.join(__dirname, '../docs/uploads/avatars');
};

// Configure multer storage for avatars
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const avatarDir = getAvatarDir();
    
    try {
      if (!fs.existsSync(avatarDir)) {
        fs.mkdirSync(avatarDir, { recursive: true });
      }
      cb(null, avatarDir);
    } catch (error) {
      const cwd = process.cwd();
      const isProduction = process.env.NODE_ENV === 'production';
      const isVercel = process.env.VERCEL === '1' || cwd.includes('/var/task');
      
      if (isProduction || isVercel) {
        const fallbackDir = '/tmp';
        console.warn(`Could not create ${avatarDir}, using ${fallbackDir} as fallback`);
        cb(null, fallbackDir);
      } else {
        console.error('Error creating avatar directory:', error);
        cb(error);
      }
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Create multer instance for avatars
const uploadAvatar = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
});

module.exports = uploadAvatar;

