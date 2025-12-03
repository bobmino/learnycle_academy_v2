const express = require('express');
const router = express.Router();
const { protect, roleRequired } = require('../middleware/auth');
const uploadProject = require('../middleware/projectUpload');
const {
  createProject,
  getProjects,
  getMyProjects,
  getProjectById,
  submitProject,
  gradeProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

// All routes require authentication
router.use(protect);

// Get my projects
router.get('/my', getMyProjects);

// Get all projects (with filters)
router.get('/', getProjects);

// Get project by ID
router.get('/:id', getProjectById);

// Create project (teacher/admin)
router.post('/', roleRequired('teacher', 'admin'), createProject);

// Update project (teacher/admin)
router.put('/:id', roleRequired('teacher', 'admin'), updateProject);

// Delete project (admin only)
router.delete('/:id', roleRequired('admin'), deleteProject);

// Submit project (student)
router.post('/:id/submit', uploadProject.array('files', 10), submitProject);

// Grade project (teacher/admin)
router.post('/:id/grade', roleRequired('teacher', 'admin'), gradeProject);

module.exports = router;

