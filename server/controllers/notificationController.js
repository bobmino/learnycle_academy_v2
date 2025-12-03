const Notification = require('../models/Notification');

/**
 * @desc    Get user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
  try {
    const { read, type, limit = 50 } = req.query;
    const userId = req.user._id;

    let query = { user: userId };

    // Filter by read status
    if (read !== undefined) {
      query.read = read === 'true';
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get unread notifications count
 * @route   GET /api/notifications/unread
 * @access  Private
 */
const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Notification.countDocuments({
      user: userId,
      read: false
    });

    const unreadNotifications = await Notification.find({
      user: userId,
      read: false
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      count: unreadCount,
      notifications: unreadNotifications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if notification belongs to user
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create notification (admin/teacher)
 * @route   POST /api/notifications
 * @access  Private/Admin/Teacher
 */
const createNotification = async (req, res) => {
  try {
    const { userId, userIds, type, title, message, relatedEntity } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({ message: 'Type, title, and message are required' });
    }

    if (userIds && Array.isArray(userIds)) {
      // Bulk create
      const notifications = userIds.map(uid => ({
        user: uid,
        type,
        title,
        message,
        relatedEntity: relatedEntity || { entityType: null, entityId: null }
      }));

      const created = await Notification.insertMany(notifications);
      res.status(201).json({ count: created.length, notifications: created });
    } else if (userId) {
      // Single notification
      const notification = await Notification.create({
        user: userId,
        type,
        title,
        message,
        relatedEntity: relatedEntity || { entityType: null, entityId: null }
      });

      res.status(201).json(notification);
    } else {
      return res.status(400).json({ message: 'userId or userIds is required' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if notification belongs to user
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification
};

