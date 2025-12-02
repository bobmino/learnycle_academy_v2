const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Determine upload directory based on environment
// In production/serverless (Vercel), use /tmp (only writable directory)
// In development, use local docs/uploads directory
const getUploadDir = () => {
  // Check if we're in a serverless environment
  // Vercel sets VERCEL=1, or we can check the working directory
  const cwd = process.cwd();
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1' || cwd.includes('/var/task');
  
  if (isProduction || isVercel) {
    return '/tmp/uploads';
  }
  return path.join(__dirname, '../docs/uploads');
};

// Don't create directory at module load time - create it lazily when needed
// This prevents errors in serverless environments where filesystem is read-only

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Get upload directory (lazy evaluation)
    const uploadDir = getUploadDir();
    
    // Create directory only when actually needed (lazy creation)
    // This prevents errors in serverless environments
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (error) {
      // If we can't create the directory, try /tmp as fallback (for serverless)
      const cwd = process.cwd();
      const isProduction = process.env.NODE_ENV === 'production';
      const isVercel = process.env.VERCEL === '1' || cwd.includes('/var/task');
      
      if (isProduction || isVercel) {
        const fallbackDir = '/tmp';
        console.warn(`Could not create ${uploadDir}, using ${fallbackDir} as fallback`);
        cb(null, fallbackDir);
      } else {
        console.error('Error creating upload directory:', error);
        cb(error);
      }
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for PDFs only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;
