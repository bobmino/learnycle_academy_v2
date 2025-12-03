const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const ModuleOrder = require('../models/ModuleOrder');
const User = require('../models/User');
const Group = require('../models/Group');

/**
 * @desc    Get all modules (filtered by user preferences)
 * @route   GET /api/modules
 * @access  Private
 */
const getModules = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const displayMode = user.preferences?.moduleDisplayMode || 'list';

    let modules;

    if (displayMode === 'assigned') {
      // Get assigned modules (from group or individual assignment)
      const userGroup = user.groupId ? await Group.findById(user.groupId) : null;
      const groupModuleIds = userGroup ? userGroup.modules : [];
      const individualModuleIds = [];

      // Find modules assigned to user individually
      const allModules = await Module.find({});
      allModules.forEach(module => {
        if (module.assignedTo?.users?.includes(req.user._id) ||
            module.assignedTo?.groups?.includes(user.groupId)) {
          individualModuleIds.push(module._id);
        }
      });

      // Combine group and individual assignments
      const assignedModuleIds = [...new Set([...groupModuleIds, ...individualModuleIds])];
      modules = await Module.find({ _id: { $in: assignedModuleIds } }).sort({ order: 1 });
    } else {
      // Get all modules
      modules = await Module.find({}).sort({ order: 1 });
    }

    // Apply custom order if exists
    const moduleOrder = await ModuleOrder.findOne({ user: req.user._id });
    if (moduleOrder && moduleOrder.moduleOrder.length > 0) {
      const orderMap = new Map();
      moduleOrder.moduleOrder.forEach(item => {
        orderMap.set(item.module.toString(), item.order);
      });

      modules.sort((a, b) => {
        const orderA = orderMap.get(a._id.toString()) ?? a.order;
        const orderB = orderMap.get(b._id.toString()) ?? b.order;
        return orderA - orderB;
      });
    }

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

/**
 * @desc    Get assigned modules for user
 * @route   GET /api/modules/assigned
 * @access  Private
 */
const getAssignedModules = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const userGroup = user.groupId ? await Group.findById(user.groupId) : null;
    const groupModuleIds = userGroup ? userGroup.modules : [];
    const individualModuleIds = [];

    // Find modules assigned to user individually
    const allModules = await Module.find({});
    allModules.forEach(module => {
      if (module.assignedTo?.users?.includes(req.user._id) ||
          (user.groupId && module.assignedTo?.groups?.includes(user.groupId))) {
        individualModuleIds.push(module._id);
      }
    });

    // Combine group and individual assignments
    const assignedModuleIds = [...new Set([...groupModuleIds, ...individualModuleIds])];
    const modules = await Module.find({ _id: { $in: assignedModuleIds } }).sort({ order: 1 });

    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user's custom module order
 * @route   GET /api/modules/my-order
 * @access  Private
 */
const getMyOrder = async (req, res) => {
  try {
    const moduleOrder = await ModuleOrder.findOne({ user: req.user._id })
      .populate('moduleOrder.module', 'title description');

    if (!moduleOrder) {
      return res.json({ moduleOrder: [] });
    }

    res.json(moduleOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Reorder modules for user
 * @route   PUT /api/modules/reorder
 * @access  Private
 */
const reorderModules = async (req, res) => {
  try {
    const { moduleOrder } = req.body;

    if (!Array.isArray(moduleOrder)) {
      return res.status(400).json({ message: 'moduleOrder must be an array' });
    }

    // Validate module IDs exist
    const moduleIds = moduleOrder.map(item => item.module);
    const modules = await Module.find({ _id: { $in: moduleIds } });
    if (modules.length !== moduleIds.length) {
      return res.status(400).json({ message: 'Some module IDs are invalid' });
    }

    // Update or create module order
    let userOrder = await ModuleOrder.findOne({ user: req.user._id });

    if (userOrder) {
      userOrder.moduleOrder = moduleOrder;
      userOrder.updatedAt = Date.now();
      await userOrder.save();
    } else {
      userOrder = await ModuleOrder.create({
        user: req.user._id,
        moduleOrder
      });
    }

    await userOrder.populate('moduleOrder.module', 'title description');
    res.json(userOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getModules,
  getModuleById,
  getAssignedModules,
  getMyOrder,
  reorderModules,
  createModule,
  updateModule,
  deleteModule
};
