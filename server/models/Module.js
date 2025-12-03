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
  projectRequired: {
    type: Boolean,
    default: false
  },
  approvalRequired: {
    type: Boolean,
    default: false
  },
  unlockMode: {
    type: String,
    enum: ['auto', 'approval'],
    default: 'auto'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Module', moduleSchema);
