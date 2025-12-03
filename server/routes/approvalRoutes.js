const express = require('express');
const router = express.Router();
const { protect, roleRequired } = require('../middleware/auth');
const {
  requestApproval,
  getPendingApprovals,
  getMyApprovals,
  approveModule,
  rejectModule
} = require('../controllers/approvalController');

// All routes require authentication
router.use(protect);

// Get my approval requests (student)
router.get('/my', getMyApprovals);

// Get pending approvals (teacher/admin)
router.get('/pending', roleRequired('teacher', 'admin'), getPendingApprovals);

// Request approval (student)
router.post('/request/:moduleId', requestApproval);

// Approve (teacher/admin)
router.post('/:id/approve', roleRequired('teacher', 'admin'), approveModule);

// Reject (teacher/admin)
router.post('/:id/reject', roleRequired('teacher', 'admin'), rejectModule);

module.exports = router;

