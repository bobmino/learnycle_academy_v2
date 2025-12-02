const express = require('express');
const router = express.Router();
const { protect, roleRequired } = require('../middleware/auth');
const { validate, prospectFormSchema } = require('../middleware/validator');
const {
  getProspects,
  createProspect,
  updateProspectStatus,
  deleteProspect
} = require('../controllers/prospectController');

// Create prospect form - public route
router.post('/', validate(prospectFormSchema), createProspect);

// Get all prospects - admin only
router.get('/', protect, roleRequired('admin'), getProspects);

// Update prospect status - admin only
router.put('/:id', protect, roleRequired('admin'), updateProspectStatus);

// Delete prospect - admin only
router.delete('/:id', protect, roleRequired('admin'), deleteProspect);

module.exports = router;
