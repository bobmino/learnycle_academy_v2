const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a quiz title']
  },
  questions: [
    {
      questionText: {
        type: String,
        required: true
      },
      options: [
        {
          text: { type: String, required: true },
          isCorrect: { type: Boolean, required: true, default: false }
        }
      ]
    }
  ],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isEmbedded: {
    type: Boolean,
    default: false
  },
  embeddedInLesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    default: null
  },
  displayPosition: {
    type: Number,
    default: 0
  },
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
quizSchema.index({ module: 1 });
quizSchema.index({ category: 1 });
quizSchema.index({ embeddedInLesson: 1 });
quizSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
