const User = require('../models/User');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const seedCategories = require('./seedCategories');

const users = [
  {
    name: 'Admin User',
    email: 'admin@learncycle.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Teacher User',
    email: 'teacher@learncycle.com',
    password: 'teacher123',
    role: 'teacher'
  },
  {
    name: 'Student Demo',
    email: 'student@learncycle.com',
    password: 'student123',
    role: 'student'
  }
];

const modules = [
  {
    title: 'Étude de Cas: Café',
    description: 'Apprenez à créer un système de gestion complet pour un café. Ce module couvre la gestion des commandes, des stocks, et de la caisse.',
    caseStudyType: 'cafe',
    order: 1,
    unlockMode: 'auto',
    approvalRequired: false,
    isActive: true
  },
  {
    title: 'Étude de Cas: Restaurant',
    description: 'Développez une application de gestion pour un restaurant incluant les réservations, le menu digital, et le suivi des tables.',
    caseStudyType: 'restaurant',
    order: 2,
    unlockMode: 'auto',
    approvalRequired: false,
    isActive: true
  },
  {
    title: 'Étude de Cas: Hôtel',
    description: 'Créez un système de réservation et de gestion hôtelière avec check-in/check-out, gestion des chambres et facturation.',
    caseStudyType: 'hotel',
    order: 3,
    unlockMode: 'auto',
    approvalRequired: false,
    isActive: true
  }
];

const lessons = [
  {
    title: 'Introduction au Projet Café',
    content: `# Introduction au Projet Café

## Objectifs
- Comprendre les besoins d'un café
- Identifier les fonctionnalités principales
- Planifier l'architecture du système

## Contexte
Dans ce projet, vous allez créer une application complète de gestion pour un café moderne.`,
    order: 1
  },
  {
    title: 'Gestion des Commandes',
    content: `# Gestion des Commandes

## Fonctionnalités
1. Créer une nouvelle commande
2. Modifier une commande en cours
3. Valider et envoyer en cuisine
4. Marquer comme terminée`,
    order: 2
  },
  {
    title: 'Introduction au Projet Restaurant',
    content: `# Introduction au Projet Restaurant

## Objectifs
- Créer un système de réservation
- Gérer les tables et leur occupation
- Créer un menu digital interactif`,
    order: 1
  },
  {
    title: 'Système de Réservation',
    content: `# Système de Réservation

## Composants
- Formulaire de réservation
- Calendrier de disponibilité
- Confirmation par email`,
    order: 2
  },
  {
    title: 'Introduction au Projet Hôtel',
    content: `# Introduction au Projet Hôtel

## Objectifs
- Créer un système de réservation de chambres
- Gérer le check-in et check-out
- Facturation automatisée`,
    order: 1
  },
  {
    title: 'Gestion des Réservations',
    content: `# Gestion des Réservations

## Processus
1. Recherche de disponibilité
2. Sélection du type de chambre
3. Informations client
4. Paiement et confirmation`,
    order: 2
  }
];

const quizzes = [
  {
    title: 'Quiz: Café',
    questions: [
      {
        questionText: 'Quelle base de données utilisons-nous pour ce projet?',
        options: [
          { text: 'MySQL', isCorrect: false },
          { text: 'MongoDB', isCorrect: true },
          { text: 'PostgreSQL', isCorrect: false },
          { text: 'SQLite', isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'Quiz: Restaurant',
    questions: [
      {
        questionText: 'Quel est l\'objectif principal du système de réservation?',
        options: [
          { text: 'Gérer le stock', isCorrect: false },
          { text: 'Réserver des tables', isCorrect: true },
          { text: 'Créer des factures', isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'Quiz: Hôtel',
    questions: [
      {
        questionText: 'Quels sont les statuts possibles d\'une réservation?',
        options: [
          { text: 'Seulement Confirmed', isCorrect: false },
          { text: 'Pending, Confirmed, CheckedIn, CheckedOut, Cancelled', isCorrect: true },
          { text: 'Active ou Inactive', isCorrect: false }
        ]
      }
    ]
  }
];

/**
 * Initialize database with default users and data
 * Only creates if they don't exist
 */
const initDatabase = async () => {
  try {
    // Seed default categories first
    await seedCategories();
    
    // Create users if they don't exist
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ User created: ${userData.email}`);
      } else {
        console.log(`ℹ️  User already exists: ${userData.email}`);
      }
    }

    // Create modules if they don't exist
    const createdModules = [];
    for (const moduleData of modules) {
      const existingModule = await Module.findOne({ title: moduleData.title });
      if (!existingModule) {
        const module = await Module.create(moduleData);
        createdModules.push(module);
        console.log(`✅ Module created: ${moduleData.title}`);
      } else {
        createdModules.push(existingModule);
        console.log(`ℹ️  Module already exists: ${moduleData.title}`);
      }
    }

    // Create lessons if modules exist
    if (createdModules.length >= 3) {
      const lessonsToCreate = [
        { ...lessons[0], module: createdModules[0]._id },
        { ...lessons[1], module: createdModules[0]._id },
        { ...lessons[2], module: createdModules[1]._id },
        { ...lessons[3], module: createdModules[1]._id },
        { ...lessons[4], module: createdModules[2]._id },
        { ...lessons[5], module: createdModules[2]._id }
      ];

      for (const lessonData of lessonsToCreate) {
        const existingLesson = await Lesson.findOne({ 
          title: lessonData.title, 
          module: lessonData.module 
        });
        if (!existingLesson) {
          await Lesson.create(lessonData);
          console.log(`✅ Lesson created: ${lessonData.title}`);
        }
      }
    }

    // Create quizzes if modules exist
    if (createdModules.length >= 3) {
      const quizzesToCreate = [
        { ...quizzes[0], module: createdModules[0]._id },
        { ...quizzes[1], module: createdModules[1]._id },
        { ...quizzes[2], module: createdModules[2]._id }
      ];

      for (const quizData of quizzesToCreate) {
        const existingQuiz = await Quiz.findOne({ 
          title: quizData.title, 
          module: quizData.module 
        });
        if (!existingQuiz) {
          await Quiz.create(quizData);
          console.log(`✅ Quiz created: ${quizData.title}`);
        }
      }
    }

    return {
      success: true,
      message: 'Database initialized successfully',
      usersCreated: users.length,
      modulesCreated: createdModules.length
    };
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = { initDatabase };

