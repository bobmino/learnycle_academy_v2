const express = require('express');
const router = express.Router();
const { protect, roleRequired } = require('../middleware/auth');
const { validate, lessonSchema } = require('../middleware/validator');
const upload = require('../middleware/upload');
const {
  getLessons,
  getLessonsByModule,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson
} = require('../controllers/lessonController');

// Get all lessons - accessible to all authenticated users
router.get('/', protect, getLessons);

// Get lessons by module - accessible to all authenticated users
router.get('/module/:moduleId', protect, getLessonsByModule);

// Get single lesson - accessible to all authenticated users
router.get('/:id', protect, getLessonById);

// Create lesson - teacher or admin only, with PDF upload
router.post(
  '/',
  protect,
  roleRequired('teacher', 'admin'),
  upload.single('pdf'),
  validate(lessonSchema),
  createLesson
);

// Update lesson - teacher or admin only, with PDF upload
router.put(
  '/:id',
  protect,
  roleRequired('teacher', 'admin'),
  upload.single('pdf'),
  updateLesson
);

// Delete lesson - admin only
router.delete('/:id', protect, roleRequired('admin'), deleteLesson);

module.exports = router;
