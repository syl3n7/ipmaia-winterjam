const { pool } = require('../config/database');

/**
 * Migration to add content fields to rules table
 */
async function addRulesContentFields() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Adding content fields to rules table...');

    // Add content columns if they don't exist
    const columns = [
      'code_of_conduct',
      'guidelines',
      'prizes',
      'evaluation',
      'participation',
      'schedule'
    ];

    for (const column of columns) {
      try {
        await client.query(`
          ALTER TABLE rules
          ADD COLUMN IF NOT EXISTS ${column} TEXT
        `);
        console.log(`✅ Added column: ${column}`);
      } catch (error) {
        console.log(`ℹ️  Column ${column} might already exist`);
      }
    }

    console.log('✅ Rules content fields migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during rules content fields migration:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  addRulesContentFields()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addRulesContentFields;
