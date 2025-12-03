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

module.exports = {
  initializeDatabase
};

