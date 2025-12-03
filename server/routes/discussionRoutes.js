const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createDiscussion,
  getDiscussions,
  getDiscussionById,
  sendMessage,
  markAsRead
} = require('../controllers/discussionController');

// All routes require authentication
router.use(protect);

// Get user's discussions
router.get('/', getDiscussions);

// Get discussion by ID
router.get('/:id', getDiscussionById);

// Create discussion
router.post('/', createDiscussion);

// Send message in discussion
router.post('/:id/messages', sendMessage);

// Mark discussion as read
router.put('/:id/read', markAsRead);

module.exports = router;

