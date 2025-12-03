const express = require('express');
const router = express.Router();
const { protect, roleRequired } = require('../middleware/auth');
const {
  getAll,
  getById,
  create,
  update,
  delete: deleteCategory
} = require('../controllers/categoryController');

// Get all categories - accessible to all
router.get('/', getAll);

// Get single category - accessible to all
router.get('/:id', getById);

// Create category - Admin/Teacher only
router.post('/', protect, roleRequired('admin', 'teacher'), create);

// Update category - Admin/Teacher only
router.put('/:id', protect, roleRequired('admin', 'teacher'), update);

// Delete category - Admin only
router.delete('/:id', protect, roleRequired('admin'), deleteCategory);

module.exports = router;

