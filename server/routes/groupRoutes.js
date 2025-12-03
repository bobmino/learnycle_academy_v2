const express = require('express');
const router = express.Router();
const { protect, roleRequired } = require('../middleware/auth');
const {
  createGroup,
  getGroups,
  getMyGroups,
  getGroupById,
  updateGroup,
  addStudents,
  removeStudent,
  assignModules,
  deleteGroup
} = require('../controllers/groupController');

// All routes require authentication
router.use(protect);

// Get my groups (student/teacher/admin)
router.get('/my', getMyGroups);

// Get all groups (with filters)
router.get('/', getGroups);

// Get group by ID
router.get('/:id', getGroupById);

// Create group (admin/teacher)
router.post('/', roleRequired('admin', 'teacher'), createGroup);

// Update group (admin/teacher of the group)
router.put('/:id', updateGroup);

// Delete group (admin only)
router.delete('/:id', roleRequired('admin'), deleteGroup);

// Add students to group
router.post('/:id/students', addStudents);

// Remove student from group
router.delete('/:id/students/:studentId', removeStudent);

// Assign modules to group
router.post('/:id/modules', assignModules);

module.exports = router;

