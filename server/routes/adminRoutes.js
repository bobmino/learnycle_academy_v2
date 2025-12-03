const express = require('express');
const router = express.Router();
const { protect, roleRequired } = require('../middleware/auth');
const { seedProfessional } = require('../controllers/seederController');
const { initializeDatabase, organizeFormationContent } = require('../controllers/adminController');

// All routes are admin only
router.use(protect);
router.use(roleRequired('admin'));

// Initialize database with default users and data (doesn't delete existing data)
router.post('/init-database', initializeDatabase);

// Seed professional content
router.post('/seed-professional', seedProfessional);

// Organize content into "Projet clé en main" formation
router.post('/organize-formation', organizeFormationContent);

module.exports = router;

