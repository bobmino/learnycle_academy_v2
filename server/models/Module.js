const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a module title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  caseStudyType: {
    type: String,
    enum: ['none', 'cafe', 'restaurant', 'hotel'],
    default: 'none'
  },
  order: {
    type: Number,
    default: 0
  },
  assignedTo: {
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    groups: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group'
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Module', moduleSchema);
