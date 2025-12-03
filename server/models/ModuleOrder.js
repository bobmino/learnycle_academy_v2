const mongoose = require('mongoose');

// Stores personalized module order for each user
const moduleOrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  moduleOrder: [{
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true
    },
    order: {
      type: Number,
      required: true
    }
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

moduleOrderSchema.index({ user: 1 });

module.exports = mongoose.model('ModuleOrder', moduleOrderSchema);

