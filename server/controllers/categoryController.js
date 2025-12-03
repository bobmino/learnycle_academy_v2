const Category = require('../models/Category');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
exports.getAll = async (req, res) => {
  try {
  const { type } = req.query;
  
  const query = {};
  if (type) {
    query.type = type;
  }
  
    const categories = await Category.find(query).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

/**
 * @desc    Get single category
 * @route   GET /api/categories/:id
 * @access  Public
 */
exports.getById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private (Admin/Teacher)
 */
exports.create = async (req, res) => {
  try {
    const { name, description, type } = req.body;
    
    // Check if category with same name and type already exists
    const existing = await Category.findOne({ name, type });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name and type already exists'
      });
    }
    
    const category = await Category.create({
      name,
      description: description || '',
      type,
      isDefault: false,
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private (Admin/Teacher)
 */
exports.update = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Prevent modification of default categories (optional - can be removed if needed)
    if (category.isDefault && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can modify default categories'
      });
    }
    
    // Check for duplicate name+type if name or type is being changed
    if (req.body.name || req.body.type) {
      const name = req.body.name || category.name;
      const type = req.body.type || category.type;
      const duplicate = await Category.findOne({ 
        name, 
        type, 
        _id: { $ne: req.params.id } 
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name and type already exists'
        });
      }
    }
    
    category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin only)
 */
exports.delete = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Prevent deletion of default categories
    if (category.isDefault) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete default categories'
      });
    }
    
    // TODO: Check if category is in use before deleting
    // For now, we'll allow deletion but this should be checked
    // by querying Module, Lesson, Quiz, Project models
    
    await Category.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};

