const express = require('express');
const router = express.Router();
const { protect, roleRequired } = require('../middleware/auth');
const { seedProfessional } = require('../controllers/seederController');

// All routes are admin only
router.use(protect);
router.use(roleRequired('admin'));

// Seed professional content
router.post('/seed-professional', seedProfessional);

module.exports = router;

