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
    
    // Get admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      return { success: false, message: 'Admin user not found' };
    }

    // Get or create categories
    let economyModuleCategory = await Category.findOne({ name: 'Économie', type: 'module' });
    if (!economyModuleCategory) {
      economyModuleCategory = await Category.create({
        name: 'Économie',
        type: 'module',
        description: 'Module d\'économie et gestion de projet',
        isDefault: true,
        createdBy: admin._id
      });
    }

    let economyLessonCategory = await Category.findOne({ name: 'Économie', type: 'lesson' });
    if (!economyLessonCategory) {
      economyLessonCategory = await Category.create({
        name: 'Économie',
        type: 'lesson',
        description: 'Leçons d\'économie et gestion',
        isDefault: true,
        createdBy: admin._id
      });
    }

    let caseStudyCategory = await Category.findOne({ name: 'Études de Cas', type: 'project' });
    if (!caseStudyCategory) {
      caseStudyCategory = await Category.create({
        name: 'Études de Cas',
        type: 'project',
        description: 'Projets d\'études de cas pratiques',
        isDefault: true,
        createdBy: admin._id
      });
    }

    // Create or get Économie module
    let economyModule = await Module.findOne({ title: 'Module: Économie' });
    if (!economyModule) {
      economyModule = await Module.create({
        title: 'Module: Économie',
        description: 'Module complet d\'économie et gestion de projet. Ce module regroupe toutes les compétences nécessaires pour créer et gérer un projet clé en main.',
        caseStudyType: 'none',
        order: 1,
        category: economyModuleCategory._id,
        isActive: true,
        createdBy: admin._id
      });
      console.log('✅ Created module: Économie');
    }

    // Get all existing lessons and assign them to Économie module
    const allLessons = await Lesson.find({});
    let lessonOrder = 1;
    
    for (const lesson of allLessons) {
      // Skip if already in Économie module
      if (lesson.module && lesson.module.toString() === economyModule._id.toString()) {
        continue;
      }
      
      await Lesson.updateOne(
        { _id: lesson._id },
        {
          $set: {
            module: economyModule._id,
            order: lessonOrder++,
            category: economyLessonCategory._id
          }
        }
      );
    }
    console.log(`✅ Assigned ${allLessons.length} lessons to Économie module`);

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

    const createdProjects = [];
    for (const caseStudy of caseStudies) {
      let project = await Project.findOne({ name: caseStudy.name });
      if (!project) {
        project = await Project.create(caseStudy);
        createdProjects.push(project.name);
        console.log(`✅ Created project: ${caseStudy.name}`);
      } else {
        createdProjects.push(project.name);
        console.log(`ℹ️  Project already exists: ${caseStudy.name}`);
      }
    }

    // Create formation
    let formation = await Formation.findOne({ name: 'Projet clé en main' });
    if (!formation) {
      formation = await Formation.create({
        name: 'Projet clé en main',
        description: 'Formation complète pour créer et gérer un projet clé en main. Cette formation comprend un module Économie avec toutes les leçons et 3 études de cas pratiques.',
        category: economyModuleCategory._id,
        modules: [economyModule._id],
        isActive: true,
        createdBy: admin._id
      });
      console.log('✅ Created formation: Projet clé en main');
    } else {
      await Formation.updateOne(
        { _id: formation._id },
        {
          $set: {
            modules: [economyModule._id],
            category: economyModuleCategory._id
          }
        }
      );
      console.log('✅ Updated formation: Projet clé en main');
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

