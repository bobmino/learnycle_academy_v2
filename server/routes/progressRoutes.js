const express = require('express');
const router = express.Router();
const { protect, roleRequired } = require('../middleware/auth');
const {
  getStudentProgress,
  getMyProgress,
  markLessonComplete,
  saveQuizScore
} = require('../controllers/progressController');

// Get my progress - accessible to authenticated users
router.get('/me', protect, getMyProgress);

// Mark lesson as complete - accessible to authenticated users
router.post('/lesson/:lessonId/complete', protect, markLessonComplete);

// Save quiz score - accessible to authenticated users
router.post('/quiz', protect, saveQuizScore);

// Get student progress by userId - teacher or admin only
router.get('/student/:userId', protect, roleRequired('teacher', 'admin'), getStudentProgress);

module.exports = router;
