const { initDatabase } = require('../utils/initDatabase');
const { organizeFormation } = require('../utils/organizeFormation');
const { reorganizeContent } = require('../utils/reorganizeContent');
const { reorganizeContentSimple } = require('../utils/reorganizeContentSimple');

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

/**
 * @desc    Reorganize content (modules → lessons in Economy module)
 * @route   POST /api/admin/reorganize-content
 * @access  Private/Admin
 */
const reorganizeContentData = async (req, res) => {
  try {
    console.log('🔄 Starting content reorganization (simple method)...');
    console.log('Request user:', req.user?.email, req.user?.role);
    
    // Use the simple reorganization method that just moves existing content
    const result = await reorganizeContentSimple();
    
    if (result.success) {
      console.log('✅ Reorganization successful:', result.message);
      res.json({
        message: result.message,
        economyModule: result.economyModule,
        lessonsMoved: result.lessonsMoved,
        caseStudies: result.caseStudies,
        caseStudyNames: result.caseStudyNames
      });
    } else {
      console.error('❌ Reorganization failed:', result.message);
      console.error('Error details:', result.error);
      console.error('Error type:', result.errorType);
      
      // Return detailed error information
      const errorResponse = {
        message: result.message || 'Error reorganizing content',
        error: result.error || 'Unknown error'
      };
      
      if (result.errorType) {
        errorResponse.errorType = result.errorType;
      }
      
      res.status(400).json(errorResponse);
    }
  } catch (error) {
    console.error('❌ Exception in reorganizeContentData:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors || {}).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return res.status(400).json({
        message: 'Validation error',
        error: 'Invalid data provided',
        validationErrors: validationErrors
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to reorganize content', 
      error: error.message || 'Internal server error',
      errorType: error.name,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  initializeDatabase,
  organizeFormationContent,
  reorganizeContentData
};

