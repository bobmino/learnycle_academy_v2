const Quiz = require('../models/Quiz');
const Module = require('../models/Module');

/**
 * @desc    Get quizzes by module
 * @route   GET /api/quiz/module/:moduleId
 * @access  Private
 */
const getQuizzesByModule = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ module: req.params.moduleId });
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

    res.json({
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      score: score.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getQuizzesByModule,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz
};
