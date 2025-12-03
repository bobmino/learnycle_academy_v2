const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [{
    questionIndex: Number,
    selectedOption: Number,
    isCorrect: Boolean
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
quizResultSchema.index({ user: 1, quiz: 1, submittedAt: -1 });
quizResultSchema.index({ quiz: 1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);

