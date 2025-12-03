const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  grade: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  comment: {
    type: String,
    trim: true
  },
  // Can be linked to module, lesson, or quiz
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    default: null
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    default: null
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
gradeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
gradeSchema.index({ user: 1, createdAt: -1 });
gradeSchema.index({ module: 1 });
gradeSchema.index({ lesson: 1 });
gradeSchema.index({ quiz: 1 });

module.exports = mongoose.model('Grade', gradeSchema);

