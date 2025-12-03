const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 * @param {Object} notificationData - Notification data
 * @param {String} notificationData.userId - User ID to notify
 * @param {String} notificationData.type - Notification type
 * @param {String} notificationData.title - Notification title
 * @param {String} notificationData.message - Notification message
 * @param {Object} notificationData.relatedEntity - Related entity (optional)
 */
const createNotification = async (notificationData) => {
  try {
    const { userId, type, title, message, relatedEntity } = notificationData;

    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      relatedEntity: relatedEntity || { entityType: null, entityId: null }
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create notifications for multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {Object} notificationData - Notification data
 */
const createBulkNotifications = async (userIds, notificationData) => {
  try {
    const notifications = userIds.map(userId => ({
      user: userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      relatedEntity: notificationData.relatedEntity || { entityType: null, entityId: null }
    }));

    await Notification.insertMany(notifications);
    return notifications;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};

/**
 * Notification types and their default messages
 */
const NOTIFICATION_TYPES = {
  MODULE_ASSIGNED: 'module_assigned',
  LESSON_COMPLETED: 'lesson_completed',
  QUIZ_SUBMITTED: 'quiz_submitted',
  GRADE_RECEIVED: 'grade_received',
  GROUP_UPDATED: 'group_updated',
  DISCUSSION_NEW: 'discussion_new',
  SYSTEM: 'system'
};

module.exports = {
  createNotification,
  createBulkNotifications,
  NOTIFICATION_TYPES
};

