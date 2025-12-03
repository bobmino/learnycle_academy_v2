const Category = require('../models/Category');

/**
 * Seed default categories into the database
 * This function is idempotent - it won't create duplicates
 */
const seedCategories = async () => {
  try {
    const defaultCategories = require('./defaultCategories');
    
    console.log('🌱 Seeding default categories...');
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const categoryData of defaultCategories) {
      try {
        // Check if category with same name and type already exists
        const existing = await Category.findOne({ 
          name: categoryData.name, 
          type: categoryData.type 
        });
        
        if (!existing) {
          await Category.create(categoryData);
          createdCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        // Skip if there's a duplicate key error (shouldn't happen due to check above)
        if (error.code !== 11000) {
          console.error(`Error seeding category ${categoryData.name} (${categoryData.type}):`, error.message);
        } else {
          skippedCount++;
        }
      }
    }
    
    console.log(`✅ Categories seeding complete: ${createdCount} created, ${skippedCount} already existed`);
    return { created: createdCount, skipped: skippedCount };
  } catch (error) {
    console.error('❌ Error seeding categories:', error.message);
    throw error;
  }
};

module.exports = seedCategories;

