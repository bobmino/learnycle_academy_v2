/**
 * Default categories for the LMS
 * These categories are seeded automatically on database initialization
 */

const defaultCategories = [
  // Formations
  { name: 'Informatique', description: 'Formations en informatique et technologies', type: 'formation', isDefault: true },
  { name: 'Développement', description: 'Formations en développement logiciel', type: 'formation', isDefault: true },
  { name: 'Économie', description: 'Formations en économie et gestion', type: 'formation', isDefault: true },
  { name: 'Digital', description: 'Formations en marketing digital et communication', type: 'formation', isDefault: true },
  { name: 'Social', description: 'Formations en sciences sociales', type: 'formation', isDefault: true },
  
  // Modules
  { name: 'Informatique', description: 'Modules d\'informatique', type: 'module', isDefault: true },
  { name: 'Développement', description: 'Modules de développement', type: 'module', isDefault: true },
  { name: 'Économie', description: 'Modules d\'économie', type: 'module', isDefault: true },
  { name: 'Digital', description: 'Modules de marketing digital', type: 'module', isDefault: true },
  { name: 'Social', description: 'Modules de sciences sociales', type: 'module', isDefault: true },
  { name: 'Marketing', description: 'Modules de marketing', type: 'module', isDefault: true },
  { name: 'Finance', description: 'Modules de finance', type: 'module', isDefault: true },
  
  // Lessons
  { name: 'Informatique', description: 'Leçons d\'informatique', type: 'lesson', isDefault: true },
  { name: 'Développement', description: 'Leçons de développement', type: 'lesson', isDefault: true },
  { name: 'Économie', description: 'Leçons d\'économie', type: 'lesson', isDefault: true },
  { name: 'Digital', description: 'Leçons de marketing digital', type: 'lesson', isDefault: true },
  { name: 'Social', description: 'Leçons de sciences sociales', type: 'lesson', isDefault: true },
  
  // Quiz
  { name: 'Informatique', description: 'Quiz d\'informatique', type: 'quiz', isDefault: true },
  { name: 'Développement', description: 'Quiz de développement', type: 'quiz', isDefault: true },
  { name: 'Économie', description: 'Quiz d\'économie', type: 'quiz', isDefault: true },
  { name: 'Digital', description: 'Quiz de marketing digital', type: 'quiz', isDefault: true },
  { name: 'Social', description: 'Quiz de sciences sociales', type: 'quiz', isDefault: true },
  
  // Projects
  { name: 'Informatique', description: 'Projets d\'informatique', type: 'project', isDefault: true },
  { name: 'Développement', description: 'Projets de développement', type: 'project', isDefault: true },
  { name: 'Économie', description: 'Projets d\'économie', type: 'project', isDefault: true },
  { name: 'Digital', description: 'Projets de marketing digital', type: 'project', isDefault: true },
  { name: 'Social', description: 'Projets de sciences sociales', type: 'project', isDefault: true }
];

module.exports = defaultCategories;

