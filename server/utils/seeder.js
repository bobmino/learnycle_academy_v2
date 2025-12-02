const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/learncycle');

const users = [
  {
    name: 'Admin User',
    email: 'admin@learncycle.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Teacher Demo',
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
    order: 1
  },
  {
    title: 'Étude de Cas: Restaurant',
    description: 'Développez une application de gestion pour un restaurant incluant les réservations, le menu digital, et le suivi des tables.',
    caseStudyType: 'restaurant',
    order: 2
  },
  {
    title: 'Étude de Cas: Hôtel',
    description: 'Créez un système de réservation et de gestion hôtelière avec check-in/check-out, gestion des chambres et facturation.',
    caseStudyType: 'hotel',
    order: 3
  }
];

const lessons = [
  // Café lessons
  {
    title: 'Introduction au Projet Café',
    content: `# Introduction au Projet Café

## Objectifs
- Comprendre les besoins d'un café
- Identifier les fonctionnalités principales
- Planifier l'architecture du système

## Contexte
Dans ce projet, vous allez créer une application complète de gestion pour un café moderne. L'application permettra de gérer les commandes, le stock, et les transactions.

## Technologies utilisées
- Frontend: React + TailwindCSS
- Backend: Node.js + Express
- Base de données: MongoDB`,
    order: 1,
    pdfUrl: '/docs/templates/etude-cafe.pdf'
  },
  {
    title: 'Gestion des Commandes',
    content: `# Gestion des Commandes

## Fonctionnalités
1. Créer une nouvelle commande
2. Modifier une commande en cours
3. Valider et envoyer en cuisine
4. Marquer comme terminée

## Modèle de données
\`\`\`javascript
{
  orderId: String,
  items: [{ product, quantity, price }],
  total: Number,
  status: String,
  createdAt: Date
}
\`\`\``,
    order: 2
  },
  // Restaurant lessons
  {
    title: 'Introduction au Projet Restaurant',
    content: `# Introduction au Projet Restaurant

## Objectifs
- Créer un système de réservation
- Gérer les tables et leur occupation
- Créer un menu digital interactif

## Fonctionnalités principales
1. Réservations en ligne
2. Gestion des tables
3. Menu digital
4. Suivi des commandes par table`,
    order: 1,
    pdfUrl: '/docs/templates/etude-restaurant.pdf'
  },
  {
    title: 'Système de Réservation',
    content: `# Système de Réservation

## Composants
- Formulaire de réservation
- Calendrier de disponibilité
- Confirmation par email
- Gestion des annulations

## Workflow
1. Client sélectionne date/heure
2. Vérification de disponibilité
3. Création de la réservation
4. Confirmation automatique`,
    order: 2
  },
  // Hotel lessons
  {
    title: 'Introduction au Projet Hôtel',
    content: `# Introduction au Projet Hôtel

## Objectifs
- Créer un système de réservation de chambres
- Gérer le check-in et check-out
- Facturation automatisée

## Modules principaux
1. Réservations
2. Gestion des chambres
3. Services complémentaires
4. Facturation`,
    order: 1,
    pdfUrl: '/docs/templates/etude-hotel.pdf'
  },
  {
    title: 'Gestion des Réservations',
    content: `# Gestion des Réservations

## Processus
1. Recherche de disponibilité
2. Sélection du type de chambre
3. Informations client
4. Paiement et confirmation

## Statuts possibles
- Pending
- Confirmed
- CheckedIn
- CheckedOut
- Cancelled`,
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
      },
      {
        questionText: 'Quel framework frontend utilisons-nous?',
        options: [
          { text: 'Vue.js', isCorrect: false },
          { text: 'Angular', isCorrect: false },
          { text: 'React', isCorrect: true },
          { text: 'Svelte', isCorrect: false }
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
          { text: 'Créer des factures', isCorrect: false },
          { text: 'Gérer le personnel', isCorrect: false }
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
          { text: 'Active ou Inactive', isCorrect: false },
          { text: 'Open ou Closed', isCorrect: false }
        ]
      }
    ]
  }
];

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Module.deleteMany();
    await Lesson.deleteMany();
    await Quiz.deleteMany();

    console.log('Data Destroyed...');

    // Create users
    const createdUsers = await User.create(users);
    console.log('Users Created...');

    // Create modules
    const createdModules = await Module.create(modules);
    console.log('Modules Created...');

    // Create lessons with module references
    const lessonsToCreate = [
      // Café lessons
      { ...lessons[0], module: createdModules[0]._id },
      { ...lessons[1], module: createdModules[0]._id },
      // Restaurant lessons
      { ...lessons[2], module: createdModules[1]._id },
      { ...lessons[3], module: createdModules[1]._id },
      // Hotel lessons
      { ...lessons[4], module: createdModules[2]._id },
      { ...lessons[5], module: createdModules[2]._id }
    ];

    const createdLessons = await Lesson.create(lessonsToCreate);
    console.log('Lessons Created...');

    // Create quizzes with module references
    const quizzesToCreate = [
      { ...quizzes[0], module: createdModules[0]._id },
      { ...quizzes[1], module: createdModules[1]._id },
      { ...quizzes[2], module: createdModules[2]._id }
    ];

    await Quiz.create(quizzesToCreate);
    console.log('Quizzes Created...');

    console.log('\n✅ Data Imported Successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('Admin: admin@learncycle.com / admin123');
    console.log('Teacher: teacher@learncycle.com / teacher123');
    console.log('Student: student@learncycle.com / student123');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Module.deleteMany();
    await Lesson.deleteMany();
    await Quiz.deleteMany();

    console.log('Data Destroyed...');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

// Check command line args
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
