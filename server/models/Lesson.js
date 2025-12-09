const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a lesson title'],
    trim: true
  },
  content: {
    type: String, // Markdown or HTML content
    required: [true, 'Please add lesson content']
  },
  pdfUrl: {
    type: String, // Path to PDF file if applicable
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  embeddedQuizzes: [{
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    },
    position: {
      type: Number,
      default: 0
    },
    displayAfter: {
      type: Boolean,
      default: false
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
lessonSchema.index({ module: 1 });
lessonSchema.index({ category: 1 });
lessonSchema.index({ order: 1 });
lessonSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
