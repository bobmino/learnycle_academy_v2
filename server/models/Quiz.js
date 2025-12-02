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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', quizSchema);
