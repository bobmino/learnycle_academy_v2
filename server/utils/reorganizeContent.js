const mongoose = require('mongoose');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Project = require('../models/Project');
const Category = require('../models/Category');
const User = require('../models/User');
const Formation = require('../models/Formation');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Réorganise le contenu selon la nouvelle structure :
 * - Les 10 modules deviennent des leçons dans un module "Économie"
 * - Les études de cas deviennent des projets numérotés
 */
const reorganizeContent = async () => {
  try {
    console.log('🔄 Starting reorganization process...');
    
    // Connect to database if not already connected
    if (mongoose.connection.readyState !== 1) {
      console.log('📡 Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/learncycle');
      console.log('✅ Connected to MongoDB');
    } else {
      console.log('✅ Already connected to MongoDB');
    }

    // Get admin and teacher users
    console.log('👤 Looking for admin and teacher users...');
    const admin = await User.findOne({ role: 'admin' });
    const teacher = await User.findOne({ role: 'teacher' });
    
    if (!admin) {
      console.error('❌ Admin user not found.');
      return { success: false, message: 'Admin user not found', error: 'No admin user exists in database' };
    }
    console.log(`✅ Found admin: ${admin.email}`);

    const assignedTeacher = teacher || admin; // Use teacher if exists, otherwise admin
    console.log(`✅ Using teacher: ${assignedTeacher.email}`);

    // Get or create category "Économie"
    let economyCategory = await Category.findOne({ name: 'Économie', type: 'module' });
    if (!economyCategory) {
      try {
        economyCategory = await Category.create({
          name: 'Économie',
          type: 'module',
          description: 'Module d\'économie et gestion de projet',
          isDefault: true,
          createdBy: admin._id
        });
        console.log('✅ Created category: Économie');
      } catch (error) {
        console.error('❌ Error creating Économie category:', error);
        // Try to find it again in case it was created concurrently
        economyCategory = await Category.findOne({ name: 'Économie', type: 'module' });
        if (!economyCategory) {
          throw new Error(`Failed to create or find Économie category: ${error.message}`);
        }
      }
    }

    // Get all existing modules (1-10) ordered by order, excluding case study modules
    // Only get modules with caseStudyType === 'none' or null (real modules, not case studies)
    const existingModules = await Module.find({
      $or: [
        { caseStudyType: { $exists: false } },
        { caseStudyType: null },
        { caseStudyType: 'none' }
      ]
    }).sort({ order: 1 }).limit(10);
    console.log(`📚 Found ${existingModules.length} modules to convert`);
    
    if (existingModules.length === 0) {
      console.log('⚠️  No modules found to reorganize.');
      return { success: false, message: 'No modules found' };
    }

    // Create or get the "Économie" module
    let economyModule = await Module.findOne({ title: 'Module: Économie' });
    
    if (!economyModule) {
      economyModule = await Module.create({
        title: 'Module: Économie',
        description: 'Module complet d\'économie et gestion de projet. Ce module regroupe toutes les compétences nécessaires pour créer et gérer un projet clé en main.',
        caseStudyType: 'none',
        order: 1,
        category: economyCategory._id,
        isActive: true,
        createdBy: assignedTeacher._id
      });
      console.log('✅ Created module: Économie');
    }

    // Convert each module (1-10) to a lesson
    let lessonOrder = 1;
    for (const oldModule of existingModules) {
      // Get lessons from the old module
      const oldLessons = await Lesson.find({ module: oldModule._id }).sort({ order: 1 });
      
      // Convert the module title to lesson title (remove "Module X:" prefix)
      const lessonTitle = oldModule.title.replace(/^Module \d+:\s*/, '');
      
      // Get lesson category (Économie for lessons)
      let economyLessonCategory = await Category.findOne({ name: 'Économie', type: 'lesson' });
      if (!economyLessonCategory) {
        try {
          economyLessonCategory = await Category.create({
            name: 'Économie',
            type: 'lesson',
            description: 'Leçons liées à l\'économie et la gestion',
            isDefault: true,
            createdBy: admin._id
          });
        } catch (error) {
          economyLessonCategory = await Category.findOne({ name: 'Économie', type: 'lesson' });
        }
      }

      // Create lesson content
      const lessonContent = oldLessons.length > 0
        ? `# ${lessonTitle}\n\n${oldModule.description || ''}\n\n## Contenu du Module\n\nCe module couvre les aspects suivants :\n\n${oldLessons.map((l, idx) => `### ${l.title}\n\n${(l.content || '').substring(0, 200)}...`).join('\n\n')}`
        : `# ${lessonTitle}\n\n${oldModule.description || 'Contenu de la leçon'}`;

      // Create a main lesson from the module
      try {
        console.log(`📝 Creating lesson ${lessonOrder}: ${lessonTitle}...`);
        const mainLesson = await Lesson.create({
          module: economyModule._id,
          title: `Leçon ${lessonOrder}: ${lessonTitle}`,
          content: lessonContent,
          order: lessonOrder,
          category: economyLessonCategory?._id || null,
          createdBy: assignedTeacher._id
        });
        
        console.log(`✅ Created lesson: ${mainLesson.title}`);
        lessonOrder++;
      } catch (error) {
        console.error(`❌ Error creating lesson ${lessonOrder}: ${lessonTitle}`, error);
        throw new Error(`Failed to create lesson "${lessonTitle}": ${error.message}`);
      }

      // Optionally, you can also create individual lessons from old lessons
      // But for now, we'll just create one main lesson per old module
    }

    // Ensure economyModule exists before creating case studies
    if (!economyModule || !economyModule._id) {
      throw new Error('Économie module must be created before case studies');
    }
    console.log(`✅ Economy module ID: ${economyModule._id}`);

    // Get or create category for case studies
    console.log('📂 Looking for or creating Études de Cas category...');
    let caseStudyCategory = await Category.findOne({ name: 'Études de Cas', type: 'project' });
    if (!caseStudyCategory) {
      try {
        caseStudyCategory = await Category.create({
          name: 'Études de Cas',
          type: 'project',
          description: 'Projets d\'études de cas pratiques',
          isDefault: true,
          createdBy: admin._id
        });
        console.log('✅ Created category: Études de Cas');
      } catch (error) {
        console.error('❌ Error creating Études de Cas category:', error);
        // Try to find it again in case it was created concurrently
        caseStudyCategory = await Category.findOne({ name: 'Études de Cas', type: 'project' });
        if (!caseStudyCategory) {
          throw new Error(`Failed to create or find Études de Cas category: ${error.message}`);
        }
      }
    } else {
      console.log('✅ Found existing Études de Cas category');
    }

    // Create the 3 case study projects (using economyModule._id which is now guaranteed to exist)
    console.log('📋 Preparing case studies...');
    const caseStudies = [
      {
        name: 'Étude de Cas 1: Café',
        description: 'Apprenez à créer un système de gestion complet pour un café. Ce projet couvre la gestion des commandes, des stocks, et de la caisse.',
        type: 'case-study',
        modules: [economyModule._id],
        instructions: `# Étude de Cas 1: Café

## Objectifs
- Créer un business plan complet pour un café
- Définir la stratégie de prospection client
- Mettre en place un système de gestion
- Planifier la communication et le marketing
- Gérer les opérations quotidiennes

## Tâches à réaliser
1. Analyse de marché et étude de faisabilité
2. Business plan détaillé
3. Plan de prospection et acquisition clients
4. Stratégie de communication
5. Plan opérationnel et gestion
6. Plan financier et projections

## Livrables
- Business plan complet (PDF)
- Présentation PowerPoint
- Fiches techniques et opérationnelles
- Plan financier sur 3 ans`,
        deliverables: [
          { name: 'Business Plan', description: 'Document complet de 20-30 pages', required: true },
          { name: 'Présentation', description: 'Présentation PowerPoint de 15-20 slides', required: true },
          { name: 'Plan Financier', description: 'Tableaux financiers sur 3 ans', required: true }
        ],
        order: 1
      },
      {
        name: 'Étude de Cas 2: Restaurant',
        description: 'Développez une application de gestion pour un restaurant incluant les réservations, le menu digital, et le suivi des tables.',
        type: 'case-study',
        modules: [economyModule._id],
        instructions: `# Étude de Cas 2: Restaurant

## Objectifs
- Développer un concept de restaurant complet
- Créer une stratégie de différenciation
- Mettre en place un système de gestion efficace
- Planifier l'ouverture et les opérations

## Tâches à réaliser
1. Concept et positionnement
2. Business plan et modèle économique
3. Plan de prospection et fidélisation
4. Stratégie marketing et communication
5. Gestion opérationnelle
6. Plan financier détaillé

## Livrables
- Concept et business plan
- Présentation du projet
- Plans opérationnels
- Modèle financier`,
        deliverables: [
          { name: 'Business Plan', description: 'Document complet avec concept détaillé', required: true },
          { name: 'Présentation', description: 'Présentation du concept et du plan', required: true },
          { name: 'Plan Opérationnel', description: 'Manuel opérationnel du restaurant', required: true }
        ],
        order: 2
      },
      {
        name: 'Étude de Cas 3: Hôtel',
        description: 'Créez un système de réservation et de gestion hôtelière avec check-in/check-out, gestion des chambres et facturation.',
        type: 'case-study',
        modules: [economyModule._id],
        instructions: `# Étude de Cas 3: Hôtel

## Objectifs
- Créer un projet hôtelier complet
- Développer une stratégie de positionnement
- Mettre en place une gestion efficace
- Planifier le développement et l'expansion

## Tâches à réaliser
1. Analyse de marché et positionnement
2. Business plan hôtelier
3. Stratégie de prospection et réservation
4. Plan marketing et communication
5. Gestion opérationnelle et qualité
6. Plan financier et investissement

## Livrables
- Business plan complet
- Présentation du projet
- Plans de gestion et opérationnels
- Modèle financier et projections`,
        deliverables: [
          { name: 'Business Plan', description: 'Document complet pour projet hôtelier', required: true },
          { name: 'Présentation', description: 'Présentation du concept hôtelier', required: true },
          { name: 'Plan de Gestion', description: 'Manuel de gestion opérationnelle', required: true }
        ],
        order: 3
      }
    ];

    // Create or update case studies
    console.log('📋 Creating/updating case studies...');
    for (const caseStudy of caseStudies) {
      try {
        // Validate modules array
        if (!caseStudy.modules || !Array.isArray(caseStudy.modules) || caseStudy.modules.length === 0) {
          throw new Error(`Case study "${caseStudy.name}" must have at least one module assigned`);
        }
        
        // Validate that all module IDs are valid ObjectIds
        for (const moduleId of caseStudy.modules) {
          if (!mongoose.Types.ObjectId.isValid(moduleId)) {
            throw new Error(`Invalid module ID in case study "${caseStudy.name}": ${moduleId}`);
          }
        }
        
        let project = await Project.findOne({ name: caseStudy.name });
        
        if (project) {
          console.log(`ℹ️  Case study "${caseStudy.name}" already exists. Updating...`);
          project.description = caseStudy.description;
          project.modules = caseStudy.modules;
          project.type = caseStudy.type || 'case-study';
          project.instructions = caseStudy.instructions || '';
          project.deliverables = caseStudy.deliverables || [];
          project.category = caseStudyCategory?._id || null;
          project.isTransversal = caseStudy.modules.length > 1;
          await project.save();
          console.log(`✅ Updated case study: ${caseStudy.name}`);
        } else {
          console.log(`📝 Creating new case study: ${caseStudy.name}...`);
          project = await Project.create({
            name: caseStudy.name,
            description: caseStudy.description,
            modules: caseStudy.modules, // This is required
            type: caseStudy.type || 'case-study',
            instructions: caseStudy.instructions || '',
            deliverables: caseStudy.deliverables || [],
            category: caseStudyCategory?._id || null,
            isTransversal: caseStudy.modules.length > 1,
            status: 'active',
            createdBy: assignedTeacher._id
          });
          console.log(`✅ Created case study: ${caseStudy.name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating/updating case study "${caseStudy.name}":`, error);
        throw new Error(`Failed to create/update case study "${caseStudy.name}": ${error.message}`);
      }
    }

    // Create or update formation
    let formation = await Formation.findOne({ name: 'Projet clé en main' });
    if (!formation) {
      formation = await Formation.create({
        name: 'Projet clé en main',
        description: 'Formation complète pour créer et gérer un projet clé en main. Cette formation comprend un module Économie avec 10 leçons et 3 études de cas pratiques.',
        category: economyCategory._id,
        modules: [economyModule._id],
        isActive: true,
        createdBy: admin._id
      });
      console.log('✅ Created formation: Projet clé en main');
    } else {
      formation.modules = [economyModule._id];
      await formation.save();
      console.log('✅ Updated formation: Projet clé en main');
    }

    // Deactivate old modules that were converted to lessons
    for (const oldModule of existingModules) {
      oldModule.isActive = false;
      await oldModule.save();
      console.log(`ℹ️  Deactivated old module: ${oldModule.title}`);
    }

    // Also deactivate old case study modules (cafe, restaurant, hotel)
    // These are now replaced by real projects
    const oldCaseStudyModules = await Module.find({
      caseStudyType: { $in: ['cafe', 'restaurant', 'hotel'] }
    });
    for (const oldCaseModule of oldCaseStudyModules) {
      oldCaseModule.isActive = false;
      await oldCaseModule.save();
      console.log(`ℹ️  Deactivated old case study module: ${oldCaseModule.title}`);
    }

    console.log('✅ Reorganization complete!');
    
    return {
      success: true,
      message: 'Content reorganized successfully',
      economyModule: {
        _id: economyModule._id,
        title: economyModule.title,
        lessonsCount: lessonOrder - 1
      },
      caseStudies: caseStudies.length
    };

  } catch (error) {
    console.error('❌ Error reorganizing content:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // More detailed error information
    let errorDetails = error.message;
    if (error.errors) {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      errorDetails = `Validation errors: ${JSON.stringify(validationErrors)}`;
    }
    
    return {
      success: false,
      message: 'Error reorganizing content',
      error: errorDetails,
      errorType: error.name
    };
  }
};

// Run if called directly
if (require.main === module) {
  reorganizeContent()
    .then(result => {
      if (result.success) {
        console.log('✅ Success:', result.message);
        process.exit(0);
      } else {
        console.error('❌ Failed:', result.message);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { reorganizeContent };

