const Module = require('../models/Module');
const Lesson = require('../models/Lesson');

/**
 * @desc    Get all modules
 * @route   GET /api/modules
 * @access  Private
 */
const getModules = async (req, res) => {
  try {
    const modules = await Module.find({}).sort({ order: 1 });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single module
 * @route   GET /api/modules/:id
 * @access  Private
 */
const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Get lessons for this module
    const lessons = await Lesson.find({ module: req.params.id }).sort({ order: 1 });
    
    res.json({ module, lessons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create module
 * @route   POST /api/modules
 * @access  Private/Teacher/Admin
 */
const createModule = async (req, res) => {
  try {
    const { title, description, caseStudyType, order } = req.body;

    const module = await Module.create({
      title,
      description,
      caseStudyType: caseStudyType || 'none',
      order: order || 0
    });

    res.status(201).json(module);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update module
 * @route   PUT /api/modules/:id
 * @access  Private/Teacher/Admin
 */
const updateModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    module.title = req.body.title || module.title;
    module.description = req.body.description || module.description;
    module.caseStudyType = req.body.caseStudyType || module.caseStudyType;
    module.order = req.body.order !== undefined ? req.body.order : module.order;

    const updatedModule = await module.save();
    res.json(updatedModule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete module
 * @route   DELETE /api/modules/:id
 * @access  Private/Admin
 */
const deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Delete all lessons associated with this module
    await Lesson.deleteMany({ module: req.params.id });

    await module.deleteOne();
    res.json({ message: 'Module and associated lessons removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule
};
