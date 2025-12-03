const express = require('express');
const router = express.Router();
const { protect, roleRequired } = require('../middleware/auth');
const {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification
} = require('../controllers/notificationController');

// All routes require authentication
router.use(protect);

// Get user's notifications
router.get('/', getNotifications);

// Get unread notifications
router.get('/unread', getUnreadNotifications);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Create notification (admin/teacher)
router.post('/', roleRequired('admin', 'teacher'), createNotification);

// Delete notification
router.delete('/:id', deleteNotification);

module.exports = router;

