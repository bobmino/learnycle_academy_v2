const express = require('express');
const router = express.Router();
const { protect, roleRequired } = require('../middleware/auth');
const {
  getAllQuizzes,
  getQuizzesByModule,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizResults,
  getStudentQuizResults,
  getQuizAnalytics
} = require('../controllers/quizController');

// Get quiz results
router.get('/results', protect, getQuizResults);

// Get quiz analytics (teacher/admin)
router.get('/analytics', protect, getQuizAnalytics);

// Get student quiz results
router.get('/results/student/:studentId', protect, getStudentQuizResults);

// Get all quizzes - accessible to all authenticated users
router.get('/', protect, getAllQuizzes);

// Get quizzes by module - accessible to all authenticated users
router.get('/module/:moduleId', protect, getQuizzesByModule);

// Get single quiz - accessible to all authenticated users
router.get('/:id', protect, getQuizById);

// Submit quiz answers - accessible to all authenticated users
router.post('/:id/submit', protect, submitQuiz);

// Create quiz - teacher or admin only
router.post('/', protect, roleRequired('teacher', 'admin'), createQuiz);

// Update quiz - teacher or admin only
router.put('/:id', protect, roleRequired('teacher', 'admin'), updateQuiz);

// Delete quiz - admin only
router.delete('/:id', protect, roleRequired('admin'), deleteQuiz);

module.exports = router;
