const express = require('express');
const router = express.Router();
const { protect, roleRequired } = require('../middleware/auth');
const {
  createGrade,
  getStudentGrades,
  getModuleGrades,
  updateGrade,
  getAnalytics
} = require('../controllers/gradeController');

// All routes require authentication
router.use(protect);

// Get analytics (teacher/admin)
router.get('/analytics', getAnalytics);

// Get student grades
router.get('/student/:studentId', getStudentGrades);

// Get module grades (teacher/admin)
router.get('/module/:moduleId', getModuleGrades);

// Create grade (teacher)
router.post('/', roleRequired('teacher', 'admin'), createGrade);

// Update grade (teacher)
router.put('/:id', roleRequired('teacher', 'admin'), updateGrade);

module.exports = router;

