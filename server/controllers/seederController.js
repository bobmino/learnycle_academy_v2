const { importProfessionalData } = require('../utils/professionalSeeder');

/**
 * @desc    Seed professional content (modules and lessons)
 * @route   POST /api/admin/seed-professional
 * @access  Private/Admin only
 */
const seedProfessional = async (req, res) => {
  try {
    const result = await importProfessionalData();
    
    if (result.success) {
      res.status(200).json({ 
        message: result.message,
        success: true,
        modules: result.modules,
        lessons: result.lessons,
        moduleTitles: result.moduleTitles
      });
    } else {
      res.status(400).json({ 
        message: result.message,
        success: false,
        existingModules: result.modules
      });
    }
  } catch (error) {
    console.error('Seeder error:', error);
    res.status(500).json({ 
      message: 'Error seeding professional content',
      error: error.message 
    });
  }
};

module.exports = {
  seedProfessional
};

