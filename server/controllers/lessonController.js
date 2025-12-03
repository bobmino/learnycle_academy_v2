const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Get all lessons
 * @route   GET /api/lessons
 * @access  Private
 */
const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({}).populate('module', 'title').sort({ order: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get lessons by module
 * @route   GET /api/lessons/module/:moduleId
 * @access  Private
 */
const getLessonsByModule = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { module: req.params.moduleId };
    if (category) query.category = category;
    const lessons = await Lesson.find(query)
      .populate('category', 'name')
      .populate('embeddedQuizzes.quiz')
      .sort({ order: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single lesson
 * @route   GET /api/lessons/:id
 * @access  Private
 */
const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('module', 'title');
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create lesson
 * @route   POST /api/lessons
 * @access  Private/Teacher/Admin
 */
const createLesson = async (req, res) => {
  try {
    const { module, title, content, order, assignToTeacher } = req.body;

    // Verify module exists
    const moduleExists = await Module.findById(module);
    if (!moduleExists) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // If admin assigns to a teacher, verify teacher exists and set createdBy to teacher
    let createdBy = req.user._id;
    if (req.user.role === 'admin' && assignToTeacher) {
      const User = require('../models/User');
      const teacher = await User.findById(assignToTeacher);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(400).json({ message: 'Invalid teacher ID' });
      }
      createdBy = assignToTeacher;
    }

    const lesson = await Lesson.create({
      module,
      title,
      content,
      order: order || 0,
      pdfUrl: req.file ? `/docs/uploads/${req.file.filename}` : null,
      category: req.body.category || null,
      createdBy
    });

    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update lesson
 * @route   PUT /api/lessons/:id
 * @access  Private/Teacher/Admin
 */
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if teacher can modify (only their own content)
    if (req.user.role === 'teacher' && lesson.createdBy && 
        lesson.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only modify your own lessons' });
    }

    if (req.body.title !== undefined) lesson.title = req.body.title;
    if (req.body.content !== undefined) lesson.content = req.body.content;
    if (req.body.order !== undefined) lesson.order = req.body.order;
    if (req.body.category !== undefined) lesson.category = req.body.category;
    if (req.body.embeddedQuizzes !== undefined) lesson.embeddedQuizzes = req.body.embeddedQuizzes;

    if (req.file) {
      lesson.pdfUrl = `/docs/uploads/${req.file.filename}`;
    }

    const updatedLesson = await lesson.save();
    await updatedLesson.populate('category', 'name');
    res.json(updatedLesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete lesson
 * @route   DELETE /api/lessons/:id
 * @access  Private/Admin
 */
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if teacher can delete (only their own content)
    if (req.user.role === 'teacher' && lesson.createdBy && 
        lesson.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own lessons' });
    }

    // Delete associated PDF if exists
    if (lesson.pdfUrl) {
      const pdfPath = path.join(__dirname, '..', lesson.pdfUrl);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    await lesson.deleteOne();
    res.json({ message: 'Lesson removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLessons,
  getLessonsByModule,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson
};
