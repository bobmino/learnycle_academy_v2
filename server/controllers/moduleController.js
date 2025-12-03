const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const ModuleOrder = require('../models/ModuleOrder');
const ModuleApproval = require('../models/ModuleApproval');
const User = require('../models/User');
const Group = require('../models/Group');

/**
 * @desc    Get all modules (filtered by user preferences)
 * @route   GET /api/modules
 * @access  Private
 */
const getModules = async (req, res) => {
  try {
    const { category } = req.query;
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
      const query = { _id: { $in: assignedModuleIds } };
      if (category) query.category = category;
      modules = await Module.find(query)
        .populate('category', 'name')
        .populate('createdBy', 'name email')
        .sort({ order: 1 });
    } else {
      // Get all modules
      const query = {};
      if (category) query.category = category;
      modules = await Module.find(query)
        .populate('category', 'name')
        .populate('createdBy', 'name email')
        .sort({ order: 1 });
    }

    // Filter by unlock mode and approval status
    const filteredModules = [];
    for (const module of modules) {
      // Check if module is active
      if (!module.isActive) continue;

      // If unlockMode is 'auto', include it
      if (module.unlockMode === 'auto') {
        filteredModules.push(module);
        continue;
      }

      // If unlockMode is 'approval', check approval status
      if (module.unlockMode === 'approval' || module.approvalRequired) {
        const approval = await ModuleApproval.findOne({
          user: req.user._id,
          module: module._id,
          status: 'approved'
        });

        // Include if approved, or if student can preview (but not complete)
        if (approval) {
          filteredModules.push(module);
        } else {
          // Allow preview but mark as locked
          const moduleObj = module.toObject();
          moduleObj.isLocked = true;
          moduleObj.requiresApproval = true;
          filteredModules.push(moduleObj);
        }
      } else {
        filteredModules.push(module);
      }
    }

    // Apply custom order if exists
    const moduleOrder = await ModuleOrder.findOne({ user: req.user._id });
    if (moduleOrder && moduleOrder.moduleOrder.length > 0) {
      const orderMap = new Map();
      moduleOrder.moduleOrder.forEach(item => {
        orderMap.set(item.module.toString(), item.order);
      });

      filteredModules.sort((a, b) => {
        const orderA = orderMap.get(a._id.toString()) ?? a.order;
        const orderB = orderMap.get(b._id.toString()) ?? b.order;
        return orderA - orderB;
      });
    }

    res.json(filteredModules);
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

    // Check if module is active
    if (!module.isActive && req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Module is not available' });
    }

    // Check approval if required
    let isApproved = true;
    let approvalStatus = null;
    if (module.unlockMode === 'approval' || module.approvalRequired) {
      const approval = await ModuleApproval.findOne({
        user: req.user._id,
        module: module._id
      });
      
      if (approval) {
        approvalStatus = approval.status;
        isApproved = approval.status === 'approved';
      } else {
        approvalStatus = 'not-requested';
        isApproved = false;
      }
    }

    // Get lessons for this module
    const lessons = await Lesson.find({ module: req.params.id }).sort({ order: 1 });
    
    // Get previous and next modules
    const allModules = await Module.find({ isActive: true }).sort({ order: 1 });
    const currentIndex = allModules.findIndex(m => m._id.toString() === module._id.toString());
    const previousModule = currentIndex > 0 ? allModules[currentIndex - 1] : null;
    const nextModule = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;

    // Check if next module is accessible
    let nextModuleAccessible = true;
    if (nextModule && (nextModule.unlockMode === 'approval' || nextModule.approvalRequired)) {
      const nextApproval = await ModuleApproval.findOne({
        user: req.user._id,
        module: nextModule._id,
        status: 'approved'
      });
      nextModuleAccessible = !!nextApproval;
    }

    res.json({ 
      module, 
      lessons,
      isApproved,
      approvalStatus,
      previousModule: previousModule ? { _id: previousModule._id, title: previousModule.title } : null,
      nextModule: nextModule ? { _id: nextModule._id, title: nextModule.title, accessible: nextModuleAccessible } : null
    });
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
    const { 
      title, 
      description, 
      caseStudyType, 
      order,
      unlockMode, 
      approvalRequired, 
      projectRequired, 
      isActive,
      category,
      formation,
      autoUnlockOnProjectValidation
    } = req.body;

    const module = await Module.create({
      title,
      description,
      caseStudyType: caseStudyType || 'none',
      order: order || 0,
      unlockMode: unlockMode || 'auto',
      approvalRequired: approvalRequired || false,
      projectRequired: projectRequired || false,
      isActive: isActive !== undefined ? isActive : true,
      category: category || null,
      formation: formation || null,
      autoUnlockOnProjectValidation: autoUnlockOnProjectValidation || false,
      createdBy: req.user._id
    });

    await module.populate('category', 'name');
    await module.populate('formation', 'name');
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

    // Check if teacher can modify (only their own content)
    if (req.user.role === 'teacher' && module.createdBy && 
        module.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only modify your own modules' });
    }

    // Update fields
    if (req.body.title !== undefined) module.title = req.body.title;
    if (req.body.description !== undefined) module.description = req.body.description;
    if (req.body.caseStudyType !== undefined) module.caseStudyType = req.body.caseStudyType;
    if (req.body.order !== undefined) module.order = req.body.order;
    if (req.body.isActive !== undefined) module.isActive = req.body.isActive;
    if (req.body.category !== undefined) module.category = req.body.category;
    if (req.body.formation !== undefined) module.formation = req.body.formation;
    if (req.body.unlockMode !== undefined) module.unlockMode = req.body.unlockMode;
    if (req.body.approvalRequired !== undefined) module.approvalRequired = req.body.approvalRequired;
    if (req.body.projectRequired !== undefined) module.projectRequired = req.body.projectRequired;
    if (req.body.autoUnlockOnProjectValidation !== undefined) {
      module.autoUnlockOnProjectValidation = req.body.autoUnlockOnProjectValidation;
    }

    const updatedModule = await module.save();
    await updatedModule.populate('category', 'name');
    await updatedModule.populate('formation', 'name');
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

    // Check if teacher can delete (only their own content)
    if (req.user.role === 'teacher' && module.createdBy && 
        module.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own modules' });
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
