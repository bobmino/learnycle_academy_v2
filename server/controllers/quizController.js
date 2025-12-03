const Quiz = require('../models/Quiz');
const Module = require('../models/Module');
const QuizResult = require('../models/QuizResult');
const StudentProgress = require('../models/StudentProgress');
const { createNotification, NOTIFICATION_TYPES } = require('../services/notificationService');

/**
 * @desc    Get quizzes by module
 * @route   GET /api/quiz/module/:moduleId
 * @access  Private
 */
const getQuizzesByModule = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { module: req.params.moduleId };
    if (category) query.category = category;
    const quizzes = await Quiz.find(query).populate('category', 'name');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all quizzes
 * @route   GET /api/quiz
 * @access  Private
 */
const getAllQuizzes = async (req, res) => {
  try {
    const { category, module } = req.query;
    const query = {};
    if (category) query.category = category;
    if (module) query.module = module;
    const quizzes = await Quiz.find(query)
      .populate('module', 'title')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single quiz
 * @route   GET /api/quiz/:id
 * @access  Private
 */
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('module', 'title');
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create quiz
 * @route   POST /api/quiz
 * @access  Private/Teacher/Admin
 */
const createQuiz = async (req, res) => {
  try {
    const { module, title, questions } = req.body;

    // Verify module exists
    const moduleExists = await Module.findById(module);
    if (!moduleExists) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const quiz = await Quiz.create({
      module,
      title,
      questions
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update quiz
 * @route   PUT /api/quiz/:id
 * @access  Private/Teacher/Admin
 */
const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    quiz.title = req.body.title || quiz.title;
    quiz.questions = req.body.questions || quiz.questions;

    const updatedQuiz = await quiz.save();
    res.json(updatedQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete quiz
 * @route   DELETE /api/quiz/:id
 * @access  Private/Admin
 */
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    await quiz.deleteOne();
    res.json({ message: 'Quiz removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Submit quiz answers
 * @route   POST /api/quiz/:id/submit
 * @access  Private
 */
const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const { answers } = req.body; // Array of selected option indices per question

    let correctCount = 0;
    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const correctOption = question.options.find(opt => opt.isCorrect);
      const correctIndex = question.options.indexOf(correctOption);
      
      if (userAnswer === correctIndex) {
        correctCount++;
      }
    });

    const score = (correctCount / quiz.questions.length) * 100;

    // Save quiz result
    const quizResult = await QuizResult.create({
      user: req.user._id,
      quiz: quiz._id,
      answers: quiz.questions.map((question, index) => {
        const userAnswer = answers[index];
        const correctOption = question.options.find(opt => opt.isCorrect);
        const correctIndex = question.options.indexOf(correctOption);
        return {
          questionIndex: index,
          selectedOption: userAnswer,
          isCorrect: userAnswer === correctIndex
        };
      }),
      score: Math.round(score * 100) / 100,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount
    });

    // Update StudentProgress
    const module = await Module.findById(quiz.module);
    if (module) {
      let progress = await StudentProgress.findOne({
        user: req.user._id,
        module: quiz.module
      });

      if (progress) {
        progress.quizScore = Math.round(score * 100) / 100;
        await progress.save();
      } else {
        await StudentProgress.create({
          user: req.user._id,
          module: quiz.module,
          quizScore: Math.round(score * 100) / 100
        });
      }
    }

    // Notify teacher if quiz is submitted
    const Group = require('../models/Group');
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    if (user.groupId) {
      const group = await Group.findById(user.groupId).populate('teacher');
      if (group.teacher) {
        await createNotification({
          userId: group.teacher._id,
          type: NOTIFICATION_TYPES.QUIZ_SUBMITTED,
          title: 'Quiz soumis',
          message: `${user.name} a soumis le quiz "${quiz.title}" avec un score de ${Math.round(score)}%`,
          relatedEntity: { entityType: 'quiz', entityId: quiz._id }
        });
      }
    }

    res.json({
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      score: Math.round(score * 100) / 100,
      resultId: quizResult._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get quiz results
 * @route   GET /api/quiz/results
 * @access  Private
 */
const getQuizResults = async (req, res) => {
  try {
    const { quizId, studentId } = req.query;
    let query = {};

    // Filter by quiz
    if (quizId) {
      query.quiz = quizId;
    }

    // Filter by student (teacher/admin can see all, student sees own)
    if (studentId) {
      if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      query.user = studentId;
    } else if (req.user.role === 'student') {
      query.user = req.user._id;
    }

    const results = await QuizResult.find(query)
      .populate('user', 'name email avatar')
      .populate('quiz', 'title module')
      .sort({ submittedAt: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get quiz results for a student
 * @route   GET /api/quiz/results/student/:studentId
 * @access  Private/Teacher/Admin (or student for own results)
 */
const getStudentQuizResults = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check permissions
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const results = await QuizResult.find({ user: studentId })
      .populate('quiz', 'title module')
      .sort({ submittedAt: -1 });

    // Calculate average
    const average = results.length > 0
      ? results.reduce((sum, r) => sum + r.score, 0) / results.length
      : 0;

    res.json({
      results,
      average: Math.round(average * 100) / 100,
      count: results.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get quiz analytics
 * @route   GET /api/quiz/analytics
 * @access  Private/Teacher/Admin
 */
const getQuizAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { quizId, groupId } = req.query;

    let query = {};

    // Filter by quiz
    if (quizId) {
      query.quiz = quizId;
    }

    // Filter by group
    if (groupId) {
      const Group = require('../models/Group');
      const group = await Group.findById(groupId);
      if (group) {
        query.user = { $in: group.students };
      }
    }

    const results = await QuizResult.find(query)
      .populate('user', 'name email groupId')
      .populate('quiz', 'title module');

    // Calculate statistics
    const totalAttempts = results.length;
    const average = totalAttempts > 0
      ? results.reduce((sum, r) => sum + r.score, 0) / totalAttempts
      : 0;

    const scoreDistribution = {
      excellent: results.filter(r => r.score >= 80).length,
      good: results.filter(r => r.score >= 60 && r.score < 80).length,
      average: results.filter(r => r.score >= 40 && r.score < 60).length,
      poor: results.filter(r => r.score < 40).length
    };

    // Group by student
    const studentStats = {};
    results.forEach(result => {
      const userId = result.user._id.toString();
      if (!studentStats[userId]) {
        studentStats[userId] = {
          user: result.user,
          attempts: [],
          average: 0,
          bestScore: 0
        };
      }
      studentStats[userId].attempts.push(result);
      if (result.score > studentStats[userId].bestScore) {
        studentStats[userId].bestScore = result.score;
      }
    });

    // Calculate averages
    Object.keys(studentStats).forEach(userId => {
      const stats = studentStats[userId];
      stats.average = stats.attempts.length > 0
        ? stats.attempts.reduce((sum, a) => sum + a.score, 0) / stats.attempts.length
        : 0;
    });

    res.json({
      totalAttempts,
      average: Math.round(average * 100) / 100,
      scoreDistribution,
      studentStats: Object.values(studentStats)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllQuizzes,
  getQuizzesByModule,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizResults,
  getStudentQuizResults,
  getQuizAnalytics
};
