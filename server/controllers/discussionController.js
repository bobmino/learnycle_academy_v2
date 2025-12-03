const Discussion = require('../models/Discussion');
const User = require('../models/User');
const { createNotification, NOTIFICATION_TYPES } = require('../services/notificationService');

/**
 * @desc    Create a new discussion
 * @route   POST /api/discussions
 * @access  Private
 */
const createDiscussion = async (req, res) => {
  try {
    const { receiverId, subject, message, relatedTo } = req.body;

    if (!receiverId || !subject || !message) {
      return res.status(400).json({ message: 'receiverId, subject, and message are required' });
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Check hierarchy: student can only message teacher/admin, teacher can message admin
    const senderRole = req.user.role;
    const receiverRole = receiver.role;

    if (senderRole === 'student' && receiverRole !== 'teacher' && receiverRole !== 'admin') {
      return res.status(403).json({ message: 'Students can only message teachers or admins' });
    }

    if (senderRole === 'teacher' && receiverRole !== 'admin') {
      return res.status(403).json({ message: 'Teachers can only message admins' });
    }

    // Create discussion with first message
    const discussion = await Discussion.create({
      sender: req.user._id,
      receiver: receiverId,
      subject,
      messages: [{
        sender: req.user._id,
        content: message
      }],
      relatedTo: relatedTo || { entityType: null, entityId: null }
    });

    // Notify receiver
    await createNotification({
      userId: receiverId,
      type: NOTIFICATION_TYPES.DISCUSSION_NEW,
      title: 'Nouvelle discussion',
      message: `${req.user.name} a démarré une discussion: "${subject}"`,
      relatedEntity: { entityType: 'discussion', entityId: discussion._id }
    });

    await discussion.populate('sender', 'name email avatar');
    await discussion.populate('receiver', 'name email avatar');

    res.status(201).json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user's discussions
 * @route   GET /api/discussions
 * @access  Private
 */
const getDiscussions = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get discussions where user is sender or receiver
    const discussions = await Discussion.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    })
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .sort({ lastMessageAt: -1 });

    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get discussion by ID
 * @route   GET /api/discussions/:id
 * @access  Private
 */
const getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .populate('messages.sender', 'name email avatar');

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is part of the discussion
    if (discussion.sender._id.toString() !== req.user._id.toString() &&
        discussion.receiver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mark messages as read for the current user
    const otherUserId = discussion.sender._id.toString() === req.user._id.toString()
      ? discussion.receiver._id
      : discussion.sender._id;

    discussion.messages.forEach(msg => {
      if (msg.sender._id.toString() !== req.user._id.toString()) {
        msg.read = true;
      }
    });

    await discussion.save();

    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Send message in discussion
 * @route   POST /api/discussions/:id/messages
 * @access  Private
 */
const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is part of the discussion
    if (discussion.sender._id.toString() !== req.user._id.toString() &&
        discussion.receiver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Add message
    discussion.messages.push({
      sender: req.user._id,
      content
    });

    await discussion.save();

    // Notify the other participant
    const otherUserId = discussion.sender._id.toString() === req.user._id.toString()
      ? discussion.receiver._id
      : discussion.sender._id;

    await createNotification({
      userId: otherUserId,
      type: NOTIFICATION_TYPES.DISCUSSION_NEW,
      title: 'Nouveau message',
      message: `${req.user.name} a envoyé un message dans "${discussion.subject}"`,
      relatedEntity: { entityType: 'discussion', entityId: discussion._id }
    });

    await discussion.populate('messages.sender', 'name email avatar');
    await discussion.populate('sender', 'name email avatar');
    await discussion.populate('receiver', 'name email avatar');

    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Mark discussion as read
 * @route   PUT /api/discussions/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is part of the discussion
    if (discussion.sender._id.toString() !== req.user._id.toString() &&
        discussion.receiver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mark all messages from the other user as read
    discussion.messages.forEach(msg => {
      if (msg.sender._id.toString() !== req.user._id.toString()) {
        msg.read = true;
      }
    });

    await discussion.save();

    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDiscussion,
  getDiscussions,
  getDiscussionById,
  sendMessage,
  markAsRead
};

