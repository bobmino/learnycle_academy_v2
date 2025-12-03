const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const discussionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  messages: [messageSchema],
  relatedTo: {
    entityType: {
      type: String,
      enum: ['module', 'lesson', null],
      default: null
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update lastMessageAt when new message is added
discussionSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1];
    this.lastMessageAt = lastMessage.createdAt || Date.now();
  }
  next();
});

// Index for efficient queries
discussionSchema.index({ sender: 1, createdAt: -1 });
discussionSchema.index({ receiver: 1, createdAt: -1 });

module.exports = mongoose.model('Discussion', discussionSchema);

