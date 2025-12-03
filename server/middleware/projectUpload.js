const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Determine upload directory for project files
const getProjectDir = () => {
  const cwd = process.cwd();
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1' || cwd.includes('/var/task');
  
  if (isProduction || isVercel) {
    return '/tmp/uploads/projects';
  }
  return path.join(__dirname, '../docs/uploads/projects');
};

// Configure multer storage for project files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const projectDir = getProjectDir();
    
    try {
      if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
      }
      cb(null, projectDir);
    } catch (error) {
      const cwd = process.cwd();
      const isProduction = process.env.NODE_ENV === 'production';
      const isVercel = process.env.VERCEL === '1' || cwd.includes('/var/task');
      
      if (isProduction || isVercel) {
        const fallbackDir = '/tmp';
        console.warn(`Could not create ${projectDir}, using ${fallbackDir} as fallback`);
        cb(null, fallbackDir);
      } else {
        console.error('Error creating project directory:', error);
        cb(error);
      }
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'project-' + req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - allow common document types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/png',
    'application/zip',
    'application/x-zip-compressed'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Allowed types: PDF, Word, Excel, Images, ZIP'), false);
  }
};

// Create multer instance for project files
const uploadProject = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  }
});

module.exports = uploadProject;

