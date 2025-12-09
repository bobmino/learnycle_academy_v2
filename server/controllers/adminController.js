const { initDatabase } = require('../utils/initDatabase');

/**
 * @desc    Initialize database with default data
 * @route   POST /api/admin/init-database
 * @access  Private/Admin
 */
const initializeDatabase = async (req, res) => {
  try {
    const result = await initDatabase();
    res.json({
      message: result.message,
      usersCreated: result.usersCreated,
      modulesCreated: result.modulesCreated
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ 
      message: 'Failed to initialize database', 
      error: error.message 
    });
  }
};

/**
 * @desc    Delete all modules except those linked to projects/case studies
 * @route   POST /api/admin/delete-modules
 * @access  Private/Admin
 */
const deleteAllModules = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const Module = require('../models/Module');
    const Project = require('../models/Project');
    const Lesson = require('../models/Lesson');
    const Quiz = require('../models/Quiz');

    // Get all projects to find which modules are linked to them
    const projects = await Project.find({});
    const projectModuleIds = new Set();
    projects.forEach(project => {
      if (project.modules && Array.isArray(project.modules)) {
        project.modules.forEach(moduleId => {
          projectModuleIds.add(moduleId.toString());
        });
      }
    });

    // Find all modules that are NOT linked to projects and are NOT case studies
    const allModules = await Module.find({
      caseStudyType: { $in: [null, 'none'] }
    });

    // Filter modules that are NOT in projectModuleIds
    const modulesToDelete = allModules.filter(module => {
      return !projectModuleIds.has(module._id.toString());
    });

    const moduleIdsToDelete = modulesToDelete.map(m => m._id);

    // Delete lessons linked to these modules
    const lessonsResult = await Lesson.deleteMany({ module: { $in: moduleIdsToDelete } });
    console.log(`✅ Deleted ${lessonsResult.deletedCount} lessons linked to ${moduleIdsToDelete.length} modules`);

    // Delete quizzes linked to these modules
    const quizzesResult = await Quiz.deleteMany({ module: { $in: moduleIdsToDelete } });
    console.log(`✅ Deleted ${quizzesResult.deletedCount} quizzes linked to ${moduleIdsToDelete.length} modules`);

    // Delete the modules
    const result = await Module.deleteMany({ _id: { $in: moduleIdsToDelete } });
    console.log(`✅ Deleted ${result.deletedCount} modules`);

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} modules and their associated lessons/quizzes`,
      deletedModules: result.deletedCount,
      deletedLessons: lessonsResult.deletedCount,
      deletedQuizzes: quizzesResult.deletedCount,
      preservedModules: projectModuleIds.size
    });
  } catch (error) {
    console.error('Error deleting modules:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting modules',
      error: error.message
    });
  }
};

module.exports = {
  initializeDatabase,
  deleteAllModules
};

