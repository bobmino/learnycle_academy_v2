const mongoose = require('mongoose');

const projectSubmissionSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  files: [{
    filename: String,
    path: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under-review', 'approved', 'needs-revision', 'rejected'],
    default: 'draft'
  },
  submittedAt: {
    type: Date,
    default: null
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  grade: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  comment: {
    type: String,
    trim: true,
    default: null
  },
  revisionNotes: {
    type: String,
    trim: true,
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
projectSubmissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
projectSubmissionSchema.index({ project: 1, student: 1 }, { unique: true });
projectSubmissionSchema.index({ student: 1 });
projectSubmissionSchema.index({ status: 1 });

module.exports = mongoose.model('ProjectSubmission', projectSubmissionSchema);

