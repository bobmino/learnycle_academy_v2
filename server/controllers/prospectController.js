const ProspectForm = require('../models/ProspectForm');

/**
 * @desc    Get all prospect forms
 * @route   GET /api/prospects
 * @access  Private/Admin
 */
const getProspects = async (req, res) => {
  try {
    const prospects = await ProspectForm.find({}).sort({ createdAt: -1 });
    res.json(prospects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create prospect form submission
 * @route   POST /api/prospects
 * @access  Public
 */
const createProspect = async (req, res) => {
  try {
    const { fullName, email, phone, interests } = req.body;

    const prospect = await ProspectForm.create({
      fullName,
      email,
      phone,
      interests
    });

    res.status(201).json({
      message: 'Form submitted successfully! We will contact you soon.',
      prospect
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update prospect status
 * @route   PUT /api/prospects/:id
 * @access  Private/Admin
 */
const updateProspectStatus = async (req, res) => {
  try {
    const prospect = await ProspectForm.findById(req.params.id);
    
    if (!prospect) {
      return res.status(404).json({ message: 'Prospect not found' });
    }

    prospect.status = req.body.status || prospect.status;

    const updatedProspect = await prospect.save();
    res.json(updatedProspect);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete prospect
 * @route   DELETE /api/prospects/:id
 * @access  Private/Admin
 */
const deleteProspect = async (req, res) => {
  try {
    const prospect = await ProspectForm.findById(req.params.id);
    
    if (!prospect) {
      return res.status(404).json({ message: 'Prospect not found' });
    }

    await prospect.deleteOne();
    res.json({ message: 'Prospect removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProspects,
  createProspect,
  updateProspectStatus,
  deleteProspect
};
