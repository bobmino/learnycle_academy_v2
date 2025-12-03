const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a project name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a project description'],
    trim: true
  },
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  }],
  isTransversal: {
    type: Boolean,
    default: false
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  type: {
    type: String,
    enum: ['case-study', 'exam', 'project'],
    default: 'project'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'active'
  },
  deliverables: [{
    name: String,
    description: String,
    required: { type: Boolean, default: true }
  }],
  dueDate: {
    type: Date,
    default: null
  },
  instructions: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  autoUnlockNextOnValidation: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Set isTransversal based on modules array length
projectSchema.pre('save', function(next) {
  if (this.modules && this.modules.length > 1) {
    this.isTransversal = true;
  } else {
    this.isTransversal = false;
  }
  next();
});

// Index for efficient queries
projectSchema.index({ modules: 1 });
projectSchema.index({ group: 1 });
projectSchema.index({ students: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ category: 1 });

module.exports = mongoose.model('Project', projectSchema);

