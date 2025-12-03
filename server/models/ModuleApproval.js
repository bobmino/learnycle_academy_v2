const mongoose = require('mongoose');

const moduleApprovalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  comment: {
    type: String,
    trim: true,
    default: null
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date,
    default: null
  }
});

// Index for efficient queries
moduleApprovalSchema.index({ user: 1, module: 1 }, { unique: true });
moduleApprovalSchema.index({ status: 1 });
moduleApprovalSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('ModuleApproval', moduleApprovalSchema);

