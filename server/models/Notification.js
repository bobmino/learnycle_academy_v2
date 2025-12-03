const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'module_assigned',
      'lesson_completed',
      'quiz_submitted',
      'grade_received',
      'group_updated',
      'discussion_new',
      'system'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['module', 'lesson', 'quiz', 'group', 'discussion', null],
      default: null
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

