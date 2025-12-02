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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lesson', lessonSchema);
