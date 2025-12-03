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
 * Réorganise le contenu de manière simple :
 * - Récupère toutes les leçons existantes et les regroupe dans un module "Économie"
 * - Récupère les modules avec caseStudyType et crée des projets correspondants
 * - Crée une formation "Projet clé en main"
 */
const reorganizeContentSimple = async () => {
  try {
    console.log('🔄 Starting simple reorganization process...');
    
    // Use existing connection - don't try to connect if already connected
    // On Vercel/serverless, connection is managed by the main server
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
    } else {
      console.log('✅ Using existing MongoDB connection');
    }

    // Get admin user
    console.log('👤 Looking for admin user...');
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ Admin user not found.');
      return { success: false, message: 'Admin user not found', error: 'No admin user exists in database' };
    }
    console.log(`✅ Found admin: ${admin.email}`);

    // Get or create category "Économie" for modules
    console.log('📂 Looking for or creating Économie category (module)...');
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
        console.error('❌ Error creating Économie category:', error);
        economyModuleCategory = await Category.findOne({ name: 'Économie', type: 'module' });
        if (!economyModuleCategory) {
          throw new Error(`Failed to create or find Économie category: ${error.message}`);
        }
      }
    } else {
      console.log('✅ Found existing Économie category (module)');
    }

    // Get or create category "Économie" for lessons
    console.log('📂 Looking for or creating Économie category (lesson)...');
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
        console.log('✅ Created category: Économie (lesson)');
      } catch (error) {
        console.error('❌ Error creating Économie lesson category:', error);
        economyLessonCategory = await Category.findOne({ name: 'Économie', type: 'lesson' });
      }
    } else {
      console.log('✅ Found existing Économie category (lesson)');
    }

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
        caseStudyCategory = await Category.findOne({ name: 'Études de Cas', type: 'project' });
        if (!caseStudyCategory) {
          throw new Error(`Failed to create or find Études de Cas category: ${error.message}`);
        }
      }
    } else {
      console.log('✅ Found existing Études de Cas category');
    }

    // Create or get the "Économie" module
    console.log('📚 Looking for or creating Économie module...');
    let economyModule = await Module.findOne({ title: 'Module: Économie' });
    
    if (!economyModule) {
      console.log('📝 Creating new Économie module...');
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
        console.error('❌ Error creating Économie module:', error);
        throw new Error(`Failed to create Économie module: ${error.message}`);
      }
    } else {
      console.log('✅ Found existing Économie module');
    }

    // Get all existing lessons from all modules
    console.log('📖 Fetching all existing lessons...');
    let allLessons = [];
    try {
      allLessons = await Lesson.find({}).populate('module', 'title').lean();
      console.log(`📚 Found ${allLessons.length} lessons to reorganize`);
    } catch (error) {
      console.error('❌ Error fetching lessons:', error);
      throw new Error(`Failed to fetch lessons: ${error.message}`);
    }

    // Move all lessons to the Économie module
    let lessonOrder = 1;
    let lessonsMoved = 0;
    let lessonsSkipped = 0;
    
    // First, get current lesson count in Économie module to set correct order
    const existingEconomyLessons = await Lesson.countDocuments({ module: economyModule._id });
    if (existingEconomyLessons > 0) {
      lessonOrder = existingEconomyLessons + 1;
      console.log(`ℹ️  Found ${existingEconomyLessons} existing lessons in Économie module, starting order from ${lessonOrder}`);
    }
    
    for (const lesson of allLessons) {
      try {
        // Skip if already in Économie module
        // Handle both populated and non-populated module references
        let currentModuleId = null;
        if (lesson.module) {
          if (typeof lesson.module === 'object' && lesson.module._id) {
            currentModuleId = lesson.module._id.toString();
          } else {
            currentModuleId = lesson.module.toString();
          }
        }
        
        if (currentModuleId && currentModuleId === economyModule._id.toString()) {
          console.log(`ℹ️  Lesson "${lesson.title}" already in Économie module, skipping...`);
          lessonsSkipped++;
          continue;
        }

        // Update lesson using updateOne for better performance
        const updateResult = await Lesson.updateOne(
          { _id: lesson._id },
          {
            $set: {
              module: economyModule._id,
              order: lessonOrder++,
              category: economyLessonCategory?._id || null
            }
          }
        );
        
        if (updateResult.modifiedCount > 0) {
          lessonsMoved++;
          console.log(`✅ Moved lesson: ${lesson.title}`);
        } else if (updateResult.matchedCount > 0) {
          console.log(`ℹ️  Lesson "${lesson.title}" was not modified (may already be in correct module)`);
        }
      } catch (error) {
        console.error(`❌ Error moving lesson "${lesson.title || lesson._id}":`, error.message);
        // Continue with next lesson - don't fail entire operation
      }
    }
    console.log(`✅ Moved ${lessonsMoved} lessons to Économie module (${lessonsSkipped} already there)`);

    // Get modules with caseStudyType (cafe, restaurant, hotel)
    console.log('☕🍽️🏨 Fetching case study modules...');
    let caseStudyModules = [];
    try {
      caseStudyModules = await Module.find({
        caseStudyType: { $in: ['cafe', 'restaurant', 'hotel'] }
      }).lean();
      console.log(`📋 Found ${caseStudyModules.length} case study modules`);
    } catch (error) {
      console.error('❌ Error fetching case study modules:', error);
      // Don't throw - continue without case studies if there's an error
      caseStudyModules = [];
    }

    // Create projects from case study modules
    const caseStudyProjects = [];
    for (const caseModule of caseStudyModules) {
      try {
        // Determine project name and type
        let projectName = '';
        let projectDescription = caseModule.description || '';
        
        if (caseModule.caseStudyType === 'cafe') {
          projectName = 'Étude de Cas 1: Café';
          if (!projectDescription) {
            projectDescription = 'Apprenez à créer un système de gestion complet pour un café. Ce projet couvre la gestion des commandes, des stocks, et de la caisse.';
          }
        } else if (caseModule.caseStudyType === 'restaurant') {
          projectName = 'Étude de Cas 2: Restaurant';
          if (!projectDescription) {
            projectDescription = 'Développez une application de gestion pour un restaurant incluant les réservations, le menu digital, et le suivi des tables.';
          }
        } else if (caseModule.caseStudyType === 'hotel') {
          projectName = 'Étude de Cas 3: Hôtel';
          if (!projectDescription) {
            projectDescription = 'Créez un système de réservation et de gestion hôtelière avec check-in/check-out, gestion des chambres et facturation.';
          }
        }

        if (!projectName) {
          console.log(`⚠️  Skipping module "${caseModule.title}" - unknown case study type`);
          continue;
        }

        // Check if project already exists
        let project = await Project.findOne({ name: projectName });
        
        if (project) {
          console.log(`ℹ️  Project "${projectName}" already exists. Updating...`);
          await Project.updateOne(
            { _id: project._id },
            {
              $set: {
                description: projectDescription,
                modules: [economyModule._id],
                type: 'case-study',
                category: caseStudyCategory?._id || null,
                isTransversal: false
              }
            }
          );
          caseStudyProjects.push(projectName);
          console.log(`✅ Updated project: ${projectName}`);
        } else {
          console.log(`📝 Creating project: ${projectName}...`);
          project = await Project.create({
            name: projectName,
            description: projectDescription,
            modules: [economyModule._id],
            type: 'case-study',
            instructions: `# ${projectName}\n\n${projectDescription}\n\n## Instructions\n\nUtilisez les compétences acquises dans le module Économie pour réaliser ce projet.`,
            deliverables: [
              { name: 'Rapport', description: 'Document complet du projet', required: true },
              { name: 'Présentation', description: 'Présentation du projet', required: true }
            ],
            category: caseStudyCategory?._id || null,
            isTransversal: false,
            status: 'active',
            createdBy: admin._id
          });
          console.log(`✅ Created project: ${projectName}`);
          caseStudyProjects.push(projectName);
        }
      } catch (error) {
        console.error(`❌ Error creating project from module "${caseModule.title}":`, error);
        // Continue with next module
      }
    }

    // Deactivate old case study modules
    for (const caseModule of caseStudyModules) {
      try {
        await Module.updateOne(
          { _id: caseModule._id },
          { $set: { isActive: false } }
        );
        console.log(`ℹ️  Deactivated case study module: ${caseModule.title}`);
      } catch (error) {
        console.error(`❌ Error deactivating module "${caseModule.title}":`, error.message);
      }
    }

    // Create or update formation
    console.log('🎓 Creating/updating formation...');
    let formation = await Formation.findOne({ name: 'Projet clé en main' });
    if (!formation) {
      try {
        formation = await Formation.create({
          name: 'Projet clé en main',
          description: 'Formation complète pour créer et gérer un projet clé en main. Cette formation comprend un module Économie avec toutes les leçons et 3 études de cas pratiques.',
          category: economyModuleCategory?._id || null,
          modules: [economyModule._id],
          isActive: true,
          createdBy: admin._id
        });
        console.log('✅ Created formation: Projet clé en main');
      } catch (error) {
        console.error('❌ Error creating formation:', error);
        console.error('Formation error details:', error.errors || error.message);
        throw new Error(`Failed to create formation: ${error.message}`);
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
        console.error('❌ Error updating formation:', error);
        throw new Error(`Failed to update formation: ${error.message}`);
      }
    }

    // Get final lesson count
    const finalLessonCount = await Lesson.countDocuments({ module: economyModule._id });

    console.log('✅ Simple reorganization complete!');
    
    return {
      success: true,
      message: 'Content reorganized successfully',
      economyModule: {
        _id: economyModule._id,
        title: economyModule.title,
        lessonsCount: finalLessonCount
      },
      lessonsMoved: lessonsMoved,
      caseStudies: caseStudyProjects.length,
      caseStudyNames: caseStudyProjects
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
  reorganizeContentSimple()
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

module.exports = { reorganizeContentSimple };

