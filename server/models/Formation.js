const mongoose = require('mongoose');

const formationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a formation name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a formation description'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
formationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
formationSchema.index({ category: 1 });
formationSchema.index({ isActive: 1 });
formationSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Formation', formationSchema);

