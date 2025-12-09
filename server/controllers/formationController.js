const Formation = require('../models/Formation');
const Module = require('../models/Module');

/**
 * @desc    Get all formations
 * @route   GET /api/formations
 * @access  Public
 */
exports.getAll = async (req, res) => {
  try {
    const { category, isActive } = req.query;
    
    const query = {};
    if (category) {
      query.category = category;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const formations = await Formation.find(query)
      .populate('category', 'name description')
      .populate('modules', 'title description order')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: formations.length,
      data: formations
    });
  } catch (error) {
    console.error('Error fetching formations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching formations',
      error: error.message
    });
  }
};

/**
 * @desc    Get single formation
 * @route   GET /api/formations/:id
 * @access  Public
 */
exports.getById = async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id)
      .populate('category', 'name description')
      .populate('modules', 'title description order')
      .populate('createdBy', 'name email');
    
    if (!formation) {
      return res.status(404).json({
        success: false,
        message: 'Formation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: formation
    });
  } catch (error) {
    console.error('Error fetching formation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching formation',
      error: error.message
    });
  }
};

/**
 * @desc    Create new formation
 * @route   POST /api/formations
 * @access  Private (Admin/Teacher)
 */
exports.create = async (req, res) => {
  try {
    const { name, description, category, modules } = req.body;
    
    // Validate modules exist
    if (modules && modules.length > 0) {
      const existingModules = await Module.find({ _id: { $in: modules } });
      if (existingModules.length !== modules.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more modules not found'
        });
      }
    }
    
    const formation = await Formation.create({
      name,
      description,
      category: category || null,
      modules: modules || [],
      isActive: true,
      createdBy: req.user._id
    });
    
    // Update modules to reference this formation
    if (modules && modules.length > 0) {
      await Module.updateMany(
        { _id: { $in: modules } },
        { $set: { formation: formation._id } }
      );
    }
    
    const populated = await Formation.findById(formation._id)
      .populate('category', 'name description')
      .populate('modules', 'title description order')
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    console.error('Error creating formation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating formation',
      error: error.message
    });
  }
};

/**
 * @desc    Update formation
 * @route   PUT /api/formations/:id
 * @access  Private (Admin/Teacher)
 */
exports.update = async (req, res) => {
  try {
    let formation = await Formation.findById(req.params.id);
    
    if (!formation) {
      return res.status(404).json({
        success: false,
        message: 'Formation not found'
      });
    }
    
    // Check if user is creator or admin
    if (formation.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this formation'
      });
    }
    
    // Handle modules update if provided
    if (req.body.modules !== undefined) {
      const oldModuleIds = formation.modules.map(m => m.toString());
      const newModuleIds = req.body.modules || [];
      
      // Validate new modules exist
      if (newModuleIds.length > 0) {
        const existingModules = await Module.find({ _id: { $in: newModuleIds } });
        if (existingModules.length !== newModuleIds.length) {
          return res.status(400).json({
            success: false,
            message: 'One or more modules not found'
          });
        }
      }
      
      // Remove formation reference from modules that are no longer in the formation
      const modulesToRemove = oldModuleIds.filter(id => !newModuleIds.includes(id));
      if (modulesToRemove.length > 0) {
        await Module.updateMany(
          { _id: { $in: modulesToRemove } },
          { $unset: { formation: '' } }
        );
      }
      
      // Add formation reference to new modules
      const modulesToAdd = newModuleIds.filter(id => !oldModuleIds.includes(id));
      if (modulesToAdd.length > 0) {
        await Module.updateMany(
          { _id: { $in: modulesToAdd } },
          { $set: { formation: formation._id } }
        );
      }
    }
    
    formation = await Formation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('category', 'name description')
      .populate('modules', 'title description order')
      .populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      data: formation
    });
  } catch (error) {
    console.error('Error updating formation:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating formation',
      error: error.message
    });
  }
};

/**
 * @desc    Delete formation
 * @route   DELETE /api/formations/:id
 * @access  Private (Admin/Teacher)
 */
exports.delete = async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id);
    
    if (!formation) {
      return res.status(404).json({
        success: false,
        message: 'Formation not found'
      });
    }
    
    // Check if user is creator or admin
    if (formation.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this formation'
      });
    }
    
    // Remove formation reference from all modules
    if (formation.modules && formation.modules.length > 0) {
      await Module.updateMany(
        { _id: { $in: formation.modules } },
        { $unset: { formation: '' } }
      );
    }
    
    await Formation.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Formation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting formation:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting formation',
      error: error.message
    });
  }
};

/**
 * @desc    Add module to formation
 * @route   POST /api/formations/:id/modules
 * @access  Private (Admin/Teacher)
 */
exports.addModule = async (req, res) => {
  try {
    const { moduleId } = req.body;
    const formation = await Formation.findById(req.params.id);
    
    if (!formation) {
      return res.status(404).json({
        success: false,
        message: 'Formation not found'
      });
    }
    
    // Check authorization
    if (formation.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this formation'
      });
    }
    
    // Check if module exists
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Check if module is already in formation
    if (formation.modules.includes(moduleId)) {
      return res.status(400).json({
        success: false,
        message: 'Module is already in this formation'
      });
    }
    
    // Add module to formation
    formation.modules.push(moduleId);
    await formation.save();
    
    // Update module to reference formation
    module.formation = formation._id;
    await module.save();
    
    const populated = await Formation.findById(formation._id)
      .populate('category', 'name description')
      .populate('modules', 'title description order')
      .populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      data: populated
    });
  } catch (error) {
    console.error('Error adding module to formation:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding module to formation',
      error: error.message
    });
  }
};

/**
 * @desc    Remove module from formation
 * @route   DELETE /api/formations/:id/modules/:moduleId
 * @access  Private (Admin/Teacher)
 */
exports.removeModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const formation = await Formation.findById(req.params.id);
    
    if (!formation) {
      return res.status(404).json({
        success: false,
        message: 'Formation not found'
      });
    }
    
    // Check authorization
    if (formation.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this formation'
      });
    }
    
    // Remove module from formation
    formation.modules = formation.modules.filter(
      m => m.toString() !== moduleId
    );
    await formation.save();
    
    // Remove formation reference from module
    await Module.findByIdAndUpdate(moduleId, { $unset: { formation: '' } });
    
    const populated = await Formation.findById(formation._id)
      .populate('category', 'name description')
      .populate('modules', 'title description order')
      .populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      data: populated
    });
  } catch (error) {
    console.error('Error removing module from formation:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing module from formation',
      error: error.message
    });
  }
};

