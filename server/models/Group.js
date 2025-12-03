const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a group name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
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
groupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Group', groupSchema);

