require('dotenv').config();
const { pool } = require('../config/database');

/**
 * Migration to add homepage content fields to game_jams table
 */
async function addHomepageContentFields() {
  try {
    console.log('🔄 Adding homepage content fields to game_jams table...');

    // Add new fields for homepage content
    await pool.query(`
      ALTER TABLE game_jams 
      ADD COLUMN IF NOT EXISTS introduction TEXT DEFAULT 'Uma game jam onde estudantes de desenvolvimento de jogos e entusiastas se juntam para criar experiências únicas em 45 horas. É um evento presencial no IPMAIA com mentores disponíveis, workshops, e muita colaboração. Todos os níveis de experiência são bem-vindos!',
      ADD COLUMN IF NOT EXISTS prizes_content TEXT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS schedule_content TEXT DEFAULT NULL;
    `);

    console.log('✅ Homepage content fields added successfully!');
    
    // Update existing records with default introduction if they don't have one
    await pool.query(`
      UPDATE game_jams 
      SET introduction = 'Uma game jam onde estudantes de desenvolvimento de jogos e entusiastas se juntam para criar experiências únicas em 45 horas. É um evento presencial no IPMAIA com mentores disponíveis, workshops, e muita colaboração. Todos os níveis de experiência são bem-vindos!'
      WHERE introduction IS NULL OR introduction = '';
    `);

    console.log('✅ Existing records updated with default introduction!');
    
  } catch (error) {
    console.error('❌ Error adding homepage content fields:', error);
    throw error;
  }
}

async function migrate() {
  try {
    await addHomepageContentFields();
    console.log('🎉 Homepage content fields migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate();
}

module.exports = { addHomepageContentFields };
