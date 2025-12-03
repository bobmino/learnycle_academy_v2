const Grade = require('../models/Grade');
const User = require('../models/User');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const StudentProgress = require('../models/StudentProgress');
const { createNotification, NOTIFICATION_TYPES } = require('../services/notificationService');

/**
 * @desc    Create a grade
 * @route   POST /api/grades
 * @access  Private/Teacher
 */
const createGrade = async (req, res) => {
  try {
    const { userId, grade, comment, moduleId, lessonId, quizId } = req.body;

    if (!userId || grade === undefined) {
      return res.status(400).json({ message: 'userId and grade are required' });
    }

    if (grade < 0 || grade > 100) {
      return res.status(400).json({ message: 'Grade must be between 0 and 100' });
    }

    // Verify at least one entity is provided
    if (!moduleId && !lessonId && !quizId) {
      return res.status(400).json({ message: 'At least one of moduleId, lessonId, or quizId is required' });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify entities exist
    if (moduleId) {
      const module = await Module.findById(moduleId);
      if (!module) {
        return res.status(404).json({ message: 'Module not found' });
      }
    }

    if (lessonId) {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
      }
    }

    if (quizId) {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
    }

    // Create grade
    const newGrade = await Grade.create({
      user: userId,
      gradedBy: req.user._id,
      grade,
      comment: comment || '',
      module: moduleId || null,
      lesson: lessonId || null,
      quiz: quizId || null
    });

    // Update StudentProgress if lesson or module
    if (lessonId) {
      let progress = await StudentProgress.findOne({
        user: userId,
        lesson: lessonId
      });

      if (progress) {
        progress.grade = grade;
        progress.teacherComment = comment || null;
        await progress.save();
      }
    }

    // Notify student
    await createNotification({
      userId,
      type: NOTIFICATION_TYPES.GRADE_RECEIVED,
      title: 'Nouvelle note reçue',
      message: `Vous avez reçu une note de ${grade}/100${comment ? ` avec le commentaire: "${comment}"` : ''}`,
      relatedEntity: {
        entityType: lessonId ? 'lesson' : moduleId ? 'module' : 'quiz',
        entityId: lessonId || moduleId || quizId
      }
    });

    await newGrade.populate('user', 'name email');
    await newGrade.populate('gradedBy', 'name email');
    if (moduleId) await newGrade.populate('module', 'title');
    if (lessonId) await newGrade.populate('lesson', 'title');
    if (quizId) await newGrade.populate('quiz', 'title');

    res.status(201).json(newGrade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get grades for a student
 * @route   GET /api/grades/student/:studentId
 * @access  Private/Teacher/Admin (or student for own grades)
 */
const getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check permissions
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const grades = await Grade.find({ user: studentId })
      .populate('gradedBy', 'name email')
      .populate('module', 'title')
      .populate('lesson', 'title')
      .populate('quiz', 'title')
      .sort({ createdAt: -1 });

    // Calculate average
    const average = grades.length > 0
      ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
      : 0;

    res.json({
      grades,
      average: Math.round(average * 100) / 100,
      count: grades.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get grades for a module
 * @route   GET /api/grades/module/:moduleId
 * @access  Private/Teacher/Admin
 */
const getModuleGrades = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { moduleId } = req.params;

    const grades = await Grade.find({ module: moduleId })
      .populate('user', 'name email avatar')
      .populate('gradedBy', 'name email')
      .sort({ createdAt: -1 });

    // Calculate average
    const average = grades.length > 0
      ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
      : 0;

    res.json({
      grades,
      average: Math.round(average * 100) / 100,
      count: grades.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update grade
 * @route   PUT /api/grades/:id
 * @access  Private/Teacher
 */
const updateGrade = async (req, res) => {
  try {
    const { grade, comment } = req.body;

    const existingGrade = await Grade.findById(req.params.id);
    if (!existingGrade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    // Check if user is the one who graded or admin
    if (existingGrade.gradedBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (grade !== undefined) {
      if (grade < 0 || grade > 100) {
        return res.status(400).json({ message: 'Grade must be between 0 and 100' });
      }
      existingGrade.grade = grade;
    }

    if (comment !== undefined) {
      existingGrade.comment = comment;
    }

    await existingGrade.save();

    // Update StudentProgress if lesson
    if (existingGrade.lesson) {
      const progress = await StudentProgress.findOne({
        user: existingGrade.user,
        lesson: existingGrade.lesson
      });

      if (progress) {
        progress.grade = existingGrade.grade;
        progress.teacherComment = existingGrade.comment;
        await progress.save();
      }
    }

    await existingGrade.populate('user', 'name email');
    await existingGrade.populate('gradedBy', 'name email');

    res.json(existingGrade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get analytics
 * @route   GET /api/grades/analytics
 * @access  Private/Teacher/Admin
 */
const getAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { groupId, moduleId } = req.query;

    let query = {};

    // Filter by group
    if (groupId) {
      const Group = require('../models/Group');
      const group = await Group.findById(groupId);
      if (group) {
        query.user = { $in: group.students };
      }
    }

    // Filter by module
    if (moduleId) {
      query.module = moduleId;
    }

    const grades = await Grade.find(query)
      .populate('user', 'name email groupId')
      .populate('module', 'title');

    // Calculate statistics
    const totalGrades = grades.length;
    const average = totalGrades > 0
      ? grades.reduce((sum, g) => sum + g.grade, 0) / totalGrades
      : 0;

    const gradeDistribution = {
      excellent: grades.filter(g => g.grade >= 80).length,
      good: grades.filter(g => g.grade >= 60 && g.grade < 80).length,
      average: grades.filter(g => g.grade >= 40 && g.grade < 60).length,
      poor: grades.filter(g => g.grade < 40).length
    };

    // Group by student
    const studentStats = {};
    grades.forEach(grade => {
      const userId = grade.user._id.toString();
      if (!studentStats[userId]) {
        studentStats[userId] = {
          user: grade.user,
          grades: [],
          average: 0
        };
      }
      studentStats[userId].grades.push(grade);
    });

    // Calculate averages
    Object.keys(studentStats).forEach(userId => {
      const stats = studentStats[userId];
      stats.average = stats.grades.length > 0
        ? stats.grades.reduce((sum, g) => sum + g.grade, 0) / stats.grades.length
        : 0;
    });

    res.json({
      totalGrades,
      average: Math.round(average * 100) / 100,
      gradeDistribution,
      studentStats: Object.values(studentStats)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGrade,
  getStudentGrades,
  getModuleGrades,
  updateGrade,
  getAnalytics
};

