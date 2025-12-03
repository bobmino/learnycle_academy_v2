const mongoose = require('mongoose');

const studentProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  quizScore: {
    type: Number, // Percentage or raw score
    default: null
  },
  grade: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  teacherComment: {
    type: String,
    trim: true,
    default: null
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user has only one progress record per lesson/module context if needed
// But typically we track progress per lesson.
studentProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model('StudentProgress', studentProgressSchema);
