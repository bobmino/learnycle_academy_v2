const express = require('express');
const router = express.Router();
const { protect, roleRequired } = require('../middleware/auth');
const {
  getAll,
  getById,
  create,
  update,
  delete: deleteFormation
} = require('../controllers/formationController');

// Get all formations - accessible to all
router.get('/', getAll);

// Get single formation - accessible to all
router.get('/:id', getById);

// Create formation - Admin/Teacher only
router.post('/', protect, roleRequired('admin', 'teacher'), create);

// Update formation - Admin/Teacher only
router.put('/:id', protect, roleRequired('admin', 'teacher'), update);

// Delete formation - Admin/Teacher only
router.delete('/:id', protect, roleRequired('admin', 'teacher'), deleteFormation);

module.exports = router;

