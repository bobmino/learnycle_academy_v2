const StudentProgress = require('../models/StudentProgress');
const Lesson = require('../models/Lesson');
const { createNotification, NOTIFICATION_TYPES } = require('../services/notificationService');

/**
 * @desc    Get student progress
 * @route   GET /api/progress/student/:userId
 * @access  Private
 */
const getStudentProgress = async (req, res) => {
  try {
    const progress = await StudentProgress.find({ user: req.params.userId })
      .populate('lesson', 'title')
      .populate('module', 'title')
      .sort({ completedAt: -1 });
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get my progress (current user)
 * @route   GET /api/progress/me
 * @access  Private
 */
const getMyProgress = async (req, res) => {
  try {
    const progress = await StudentProgress.find({ user: req.user._id })
      .populate('lesson', 'title')
      .populate('module', 'title')
      .sort({ completedAt: -1 });
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Mark lesson as complete
 * @route   POST /api/progress/lesson/:lessonId/complete
 * @access  Private
 */
const markLessonComplete = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if progress already exists
    let progress = await StudentProgress.findOne({
      user: req.user._id,
      lesson: req.params.lessonId
    });

    if (progress) {
      progress.isCompleted = true;
      progress.completedAt = Date.now();
    } else {
      progress = await StudentProgress.create({
        user: req.user._id,
        lesson: req.params.lessonId,
        module: lesson.module,
        isCompleted: true
      });
    }

    await progress.save();

    // Notify teacher if lesson is completed
    const User = require('../models/User');
    const Group = require('../models/Group');
    const user = await User.findById(req.user._id);
    
    if (user.groupId) {
      const group = await Group.findById(user.groupId).populate('teacher');
      if (group.teacher) {
        await createNotification({
          userId: group.teacher._id,
          type: NOTIFICATION_TYPES.LESSON_COMPLETED,
          title: 'Leçon complétée',
          message: `${user.name} a complété la leçon "${lesson.title}"`,
          relatedEntity: { entityType: 'lesson', entityId: lesson._id }
        });
      }
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Save quiz score
 * @route   POST /api/progress/quiz
 * @access  Private
 */
const saveQuizScore = async (req, res) => {
  try {
    const { moduleId, score } = req.body;

    const progress = await StudentProgress.create({
      user: req.user._id,
      module: moduleId,
      quizScore: score,
      isCompleted: true
    });

    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentProgress,
  getMyProgress,
  markLessonComplete,
  saveQuizScore
};
