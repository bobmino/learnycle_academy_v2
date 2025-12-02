const express = require('express');
const router = express.Router();
const { protect, roleRequired } = require('../middleware/auth');
const { validate, moduleSchema } = require('../middleware/validator');
const {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule
} = require('../controllers/moduleController');

// Get all modules - accessible to all authenticated users
router.get('/', protect, getModules);

// Get single module - accessible to all authenticated users
router.get('/:id', protect, getModuleById);

// Create module - teacher or admin only
router.post('/', protect, roleRequired('teacher', 'admin'), validate(moduleSchema), createModule);

// Update module - teacher or admin only
router.put('/:id', protect, roleRequired('teacher', 'admin'), validate(moduleSchema), updateModule);

// Delete module - admin only
router.delete('/:id', protect, roleRequired('admin'), deleteModule);

module.exports = router;
