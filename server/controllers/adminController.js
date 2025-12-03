const { initDatabase } = require('../utils/initDatabase');
const { organizeFormation } = require('../utils/organizeFormation');

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
 * @desc    Organize content into "Projet clé en main" formation
 * @route   POST /api/admin/organize-formation
 * @access  Private/Admin
 */
const organizeFormationContent = async (req, res) => {
  try {
    const result = await organizeFormation();
    
    if (result.success) {
      res.json({
        message: result.message,
        formation: result.formation,
        caseStudies: result.caseStudies
      });
    } else {
      res.status(400).json({
        message: result.message,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error organizing formation:', error);
    res.status(500).json({ 
      message: 'Failed to organize formation', 
      error: error.message 
    });
  }
};

module.exports = {
  initializeDatabase,
  organizeFormationContent
};

