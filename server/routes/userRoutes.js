const express = require('express');
const router = express.Router();
const { protect, roleRequired } = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// All routes are protected and admin only
router.use(protect);
router.use(roleRequired('admin'));

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
