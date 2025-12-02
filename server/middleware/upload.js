const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Detect if running on Vercel (serverless environment)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV || process.env.NOW_REGION;

// On Vercel, use /tmp for uploads (only writable directory in serverless)
// In development, use the local docs/uploads directory
const uploadDir = isVercel 
  ? '/tmp/uploads'
  : path.join(__dirname, '../docs/uploads');

// Ensure upload directory exists (only in non-Vercel environments)
// On Vercel, we'll create it lazily when needed
if (!isVercel && !fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // On Vercel, ensure /tmp/uploads exists before using it
    if (isVercel && !fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
      } catch (error) {
        console.error('Error creating /tmp/uploads:', error);
        return cb(error);
      }
    }
    cb(null, uploadDir);
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
