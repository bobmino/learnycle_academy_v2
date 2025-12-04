const express = require('express');
const router = express.Router();
const { protect, roleRequired } = require('../middleware/auth');
const { initializeDatabase, organizeFormationContent } = require('../controllers/adminController');

// All routes are admin only
router.use(protect);
router.use(roleRequired('admin'));

// Initialize database with default users and data (doesn't delete existing data)
router.post('/init-database', initializeDatabase);

// Organize content into "Projet clé en main" formation
router.post('/organize-formation', organizeFormationContent);

module.exports = router;

