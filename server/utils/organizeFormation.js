const mongoose = require('mongoose');
const Formation = require('../models/Formation');
const Module = require('../models/Module');
const Project = require('../models/Project');
const Category = require('../models/Category');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Organize existing content into "Projet clé en main" formation
 * - Creates the formation
 * - Assigns all existing modules (1-10) to the formation
 * - Creates case studies (café, restaurant, hôtel) as projects
 */
const organizeFormation = async () => {
  try {
    // Connect to database if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/learncycle');
      console.log('✅ Connected to MongoDB');
    }

    // Get admin user (for createdBy)
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ Admin user not found. Please create an admin user first.');
      return { success: false, message: 'Admin user not found' };
    }

    // Get or create category for the formation
    let formationCategory = await Category.findOne({ name: 'Développement', type: 'formation' });
    if (!formationCategory) {
      formationCategory = await Category.create({
        name: 'Développement',
        type: 'formation',
        description: 'Formation en développement et gestion de projet',
        isDefault: true
      });
      console.log('✅ Created category: Développement');
    }

    // Get all existing modules (ordered by order field)
    const allModules = await Module.find({}).sort({ order: 1 });
    console.log(`📚 Found ${allModules.length} modules`);

    if (allModules.length === 0) {
      console.log('⚠️  No modules found. Please seed modules first.');
      return { success: false, message: 'No modules found' };
    }

    // Check if formation already exists
    let formation = await Formation.findOne({ name: 'Projet clé en main' });
    
    if (formation) {
      console.log('ℹ️  Formation "Projet clé en main" already exists. Updating...');
      // Update existing formation
      formation.modules = allModules.map(m => m._id);
      formation.category = formationCategory._id;
      await formation.save();
      console.log('✅ Updated existing formation');
    } else {
      // Create new formation
      formation = await Formation.create({
        name: 'Projet clé en main',
        description: 'Formation complète pour créer et gérer un projet clé en main. Cette formation comprend 10 modules couvrant tous les aspects de la gestion de projet, de la prospection client à la maintenance.',
        category: formationCategory._id,
        modules: allModules.map(m => m._id),
        isActive: true,
        createdBy: admin._id
      });
      console.log('✅ Created formation: Projet clé en main');
    }

    // Update all modules to link them to the formation
    for (const module of allModules) {
      if (!module.formation || module.formation.toString() !== formation._id.toString()) {
        module.formation = formation._id;
        await module.save();
      }
    }
    console.log(`✅ Updated ${allModules.length} modules to link to formation`);

    // Get or create category for case studies
    let caseStudyCategory = await Category.findOne({ name: 'Études de Cas', type: 'project' });
    if (!caseStudyCategory) {
      caseStudyCategory = await Category.create({
        name: 'Études de Cas',
        type: 'project',
        description: 'Projets d\'études de cas pratiques',
        isDefault: true
      });
      console.log('✅ Created category: Études de Cas');
    }

    // Create case studies as projects
    const caseStudies = [
      {
        name: 'Étude de Cas - Café',
        description: 'Projet complet de création et gestion d\'un café. Ce projet transversal vous permettra d\'appliquer toutes les compétences acquises dans les modules de la formation.',
        type: 'case-study',
        modules: allModules.map(m => m._id), // Transversal project
        instructions: `# Étude de Cas - Café

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
        ]
      },
      {
        name: 'Étude de Cas - Restaurant',
        description: 'Projet complet de création et gestion d\'un restaurant. Application pratique de toutes les compétences de la formation.',
        type: 'case-study',
        modules: allModules.map(m => m._id), // Transversal project
        instructions: `# Étude de Cas - Restaurant

## Objectifs
- Développer un concept de restaurant complet
- Créer une stratégie de différenciation
- Mettre en place un système de gestion efficace
- Planifier l\'ouverture et les opérations

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
        ]
      },
      {
        name: 'Étude de Cas - Hôtel',
        description: 'Projet complet de création et gestion d\'un hôtel. Projet transversal intégrant tous les modules de la formation.',
        type: 'case-study',
        modules: allModules.map(m => m._id), // Transversal project
        instructions: `# Étude de Cas - Hôtel

## Objectifs
- Créer un projet hôtelier complet
- Développer une stratégie de positionnement
- Mettre en place une gestion efficace
- Planifier le développement et l\'expansion

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
        ]
      }
    ];

    // Create or update case studies
    for (const caseStudy of caseStudies) {
      let project = await Project.findOne({ name: caseStudy.name });
      
      if (project) {
        console.log(`ℹ️  Case study "${caseStudy.name}" already exists. Updating...`);
        project.description = caseStudy.description;
        project.modules = caseStudy.modules;
        project.type = caseStudy.type;
        project.instructions = caseStudy.instructions;
        project.deliverables = caseStudy.deliverables;
        project.category = caseStudyCategory._id;
        project.isTransversal = true;
        await project.save();
      } else {
        project = await Project.create({
          name: caseStudy.name,
          description: caseStudy.description,
          modules: caseStudy.modules,
          type: caseStudy.type,
          instructions: caseStudy.instructions,
          deliverables: caseStudy.deliverables,
          category: caseStudyCategory._id,
          isTransversal: true,
          status: 'active',
          createdBy: admin._id
        });
        console.log(`✅ Created case study: ${caseStudy.name}`);
      }
    }

    console.log('✅ Organization complete!');
    
    return {
      success: true,
      message: 'Formation organized successfully',
      formation: {
        _id: formation._id,
        name: formation.name,
        modulesCount: allModules.length
      },
      caseStudies: caseStudies.length
    };

  } catch (error) {
    console.error('❌ Error organizing formation:', error);
    return {
      success: false,
      message: 'Error organizing formation',
      error: error.message
    };
  }
};

// Run if called directly
if (require.main === module) {
  organizeFormation()
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

module.exports = { organizeFormation };

