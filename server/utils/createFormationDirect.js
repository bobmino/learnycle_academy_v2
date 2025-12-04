const mongoose = require('mongoose');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Project = require('../models/Project');
const Category = require('../models/Category');
const User = require('../models/User');
const Formation = require('../models/Formation');

/**
 * Crée directement la formation "Projet clé en main" avec :
 * - Un module "Économie" contenant toutes les leçons existantes
 * - 3 projets d'études de cas (Café, Restaurant, Hôtel)
 * - La formation "Projet clé en main"
 */
const createFormationDirect = async () => {
  try {
    console.log('🔄 Creating formation directly...');
    
    // Ensure MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  MongoDB not connected. Attempting connection...');
      try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/learncycle', {
          serverSelectionTimeoutMS: 5000
        });
        console.log('✅ Connected to MongoDB');
      } catch (connectError) {
        console.error('❌ Failed to connect to MongoDB:', connectError.message);
        return {
          success: false,
          message: 'Database connection failed',
          error: connectError.message
        };
      }
    }
    
    // Get admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ Admin user not found');
      return { success: false, message: 'Admin user not found', error: 'No admin user exists in database' };
    }
    console.log(`✅ Found admin: ${admin.email}`);

    // Get or create categories
    console.log('📂 Getting or creating categories...');
    let economyModuleCategory = await Category.findOne({ name: 'Économie', type: 'module' });
    if (!economyModuleCategory) {
      try {
        economyModuleCategory = await Category.create({
          name: 'Économie',
          type: 'module',
          description: 'Module d\'économie et gestion de projet',
          isDefault: true,
          createdBy: admin._id
        });
        console.log('✅ Created category: Économie (module)');
      } catch (error) {
        console.error('❌ Error creating Économie category (module):', error.message);
        economyModuleCategory = await Category.findOne({ name: 'Économie', type: 'module' });
        if (!economyModuleCategory) {
          return { success: false, message: 'Failed to create or find Économie category (module)', error: error.message };
        }
      }
    } else {
      console.log('✅ Found category: Économie (module)');
    }

    let economyLessonCategory = await Category.findOne({ name: 'Économie', type: 'lesson' });
    if (!economyLessonCategory) {
      try {
        economyLessonCategory = await Category.create({
          name: 'Économie',
          type: 'lesson',
          description: 'Leçons d\'économie et gestion',
          isDefault: true,
          createdBy: admin._id
        });
        console.log('✅ Created category: Économie (lesson)');
      } catch (error) {
        console.error('❌ Error creating Économie category (lesson):', error.message);
        economyLessonCategory = await Category.findOne({ name: 'Économie', type: 'lesson' });
        if (!economyLessonCategory) {
          return { success: false, message: 'Failed to create or find Économie category (lesson)', error: error.message };
        }
      }
    } else {
      console.log('✅ Found category: Économie (lesson)');
    }

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
        console.error('❌ Error creating Études de Cas category:', error.message);
        caseStudyCategory = await Category.findOne({ name: 'Études de Cas', type: 'project' });
        if (!caseStudyCategory) {
          return { success: false, message: 'Failed to create or find Études de Cas category', error: error.message };
        }
      }
    } else {
      console.log('✅ Found category: Études de Cas');
    }

    // Create or get Économie module
    console.log('📚 Creating or getting Économie module...');
    let economyModule = await Module.findOne({ title: 'Module: Économie' });
    if (!economyModule) {
      try {
        economyModule = await Module.create({
          title: 'Module: Économie',
          description: 'Module complet d\'économie et gestion de projet. Ce module regroupe toutes les compétences nécessaires pour créer et gérer un projet clé en main.',
          caseStudyType: 'none',
          order: 1,
          category: economyModuleCategory?._id || null,
          isActive: true,
          createdBy: admin._id
        });
        console.log('✅ Created module: Économie');
      } catch (error) {
        console.error('❌ Error creating Économie module:', error.message);
        console.error('Validation errors:', error.errors);
        return { success: false, message: 'Failed to create Économie module', error: error.message };
      }
    } else {
      console.log('✅ Found existing module: Économie');
    }

    if (!economyModule || !economyModule._id) {
      return { success: false, message: 'Failed to create or find Économie module' };
    }

    // Get all existing lessons and assign them to Économie module
    console.log('📖 Fetching all lessons...');
    const allLessons = await Lesson.find({});
    console.log(`📚 Found ${allLessons.length} lessons`);
    
    let lessonOrder = 1;
    let lessonsAssigned = 0;
    let lessonsSkipped = 0;
    
    for (const lesson of allLessons) {
      try {
        // Skip if already in Économie module
        const currentModuleId = lesson.module?._id?.toString() || lesson.module?.toString();
        if (currentModuleId && currentModuleId === economyModule._id.toString()) {
          lessonsSkipped++;
          continue;
        }
        
        await Lesson.updateOne(
          { _id: lesson._id },
          {
            $set: {
              module: economyModule._id,
              order: lessonOrder++,
              category: economyLessonCategory?._id || null
            }
          }
        );
        lessonsAssigned++;
      } catch (error) {
        console.error(`❌ Error assigning lesson "${lesson.title || lesson._id}":`, error.message);
        // Continue with next lesson
      }
    }
    console.log(`✅ Assigned ${lessonsAssigned} lessons to Économie module (${lessonsSkipped} already there)`);

    // Create 3 case study projects
    const caseStudies = [
      {
        name: 'Étude de Cas 1: Café',
        description: 'Apprenez à créer un système de gestion complet pour un café. Ce projet couvre la gestion des commandes, des stocks, et de la caisse.',
        type: 'case-study',
        modules: [economyModule._id],
        instructions: `# Étude de Cas 1: Café\n\nCréez un système de gestion complet pour un café.`,
        deliverables: [
          { name: 'Rapport', description: 'Document complet du projet', required: true },
          { name: 'Présentation', description: 'Présentation du projet', required: true }
        ],
        category: caseStudyCategory._id,
        createdBy: admin._id
      },
      {
        name: 'Étude de Cas 2: Restaurant',
        description: 'Développez une application de gestion pour un restaurant incluant les réservations, le menu digital, et le suivi des tables.',
        type: 'case-study',
        modules: [economyModule._id],
        instructions: `# Étude de Cas 2: Restaurant\n\nDéveloppez une application de gestion pour un restaurant.`,
        deliverables: [
          { name: 'Rapport', description: 'Document complet du projet', required: true },
          { name: 'Présentation', description: 'Présentation du projet', required: true }
        ],
        category: caseStudyCategory._id,
        createdBy: admin._id
      },
      {
        name: 'Étude de Cas 3: Hôtel',
        description: 'Créez un système de réservation et de gestion hôtelière avec check-in/check-out, gestion des chambres et facturation.',
        type: 'case-study',
        modules: [economyModule._id],
        instructions: `# Étude de Cas 3: Hôtel\n\nCréez un système de gestion hôtelière.`,
        deliverables: [
          { name: 'Rapport', description: 'Document complet du projet', required: true },
          { name: 'Présentation', description: 'Présentation du projet', required: true }
        ],
        category: caseStudyCategory._id,
        createdBy: admin._id
      }
    ];

    // Create 3 case study projects
    console.log('📋 Creating case study projects...');
    const createdProjects = [];
    for (const caseStudy of caseStudies) {
      try {
        let project = await Project.findOne({ name: caseStudy.name });
        if (!project) {
          // Ensure all required fields are present
          const projectData = {
            name: caseStudy.name,
            description: caseStudy.description,
            modules: caseStudy.modules, // Required array
            type: caseStudy.type,
            instructions: caseStudy.instructions || '',
            deliverables: caseStudy.deliverables || [],
            category: caseStudyCategory?._id || null,
            isTransversal: false,
            status: 'active',
            createdBy: admin._id
          };
          
          project = await Project.create(projectData);
          createdProjects.push(project.name);
          console.log(`✅ Created project: ${caseStudy.name}`);
        } else {
          // Update existing project
          await Project.updateOne(
            { _id: project._id },
            {
              $set: {
                modules: caseStudy.modules,
                category: caseStudyCategory?._id || null,
                type: caseStudy.type
              }
            }
          );
          createdProjects.push(project.name);
          console.log(`ℹ️  Updated existing project: ${caseStudy.name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating/updating project "${caseStudy.name}":`, error.message);
        console.error('Validation errors:', error.errors);
        // Continue with next project
      }
    }

    // Create formation
    console.log('🎓 Creating or updating formation...');
    let formation = await Formation.findOne({ name: 'Projet clé en main' });
    if (!formation) {
      try {
        formation = await Formation.create({
          name: 'Projet clé en main',
          description: 'Formation complète pour créer et gérer un projet clé en main. Cette formation comprend un module Économie avec toutes les leçons et 3 études de cas pratiques.',
          category: economyModuleCategory?._id || null,
          modules: [economyModule._id],
          isActive: true,
          createdBy: admin._id // Required field
        });
        console.log('✅ Created formation: Projet clé en main');
      } catch (error) {
        console.error('❌ Error creating formation:', error.message);
        console.error('Validation errors:', error.errors);
        return { success: false, message: 'Failed to create formation', error: error.message };
      }
    } else {
      try {
        await Formation.updateOne(
          { _id: formation._id },
          {
            $set: {
              modules: [economyModule._id],
              category: economyModuleCategory?._id || null
            }
          }
        );
        console.log('✅ Updated formation: Projet clé en main');
      } catch (error) {
        console.error('❌ Error updating formation:', error.message);
        return { success: false, message: 'Failed to update formation', error: error.message };
      }
    }

    const finalLessonCount = await Lesson.countDocuments({ module: economyModule._id });

    return {
      success: true,
      message: 'Formation created successfully',
      economyModule: {
        _id: economyModule._id,
        title: economyModule.title,
        lessonsCount: finalLessonCount
      },
      projects: createdProjects.length,
      projectNames: createdProjects
    };

  } catch (error) {
    console.error('❌ Error creating formation:', error);
    return {
      success: false,
      message: 'Error creating formation',
      error: error.message
    };
  }
};

module.exports = { createFormationDirect };

