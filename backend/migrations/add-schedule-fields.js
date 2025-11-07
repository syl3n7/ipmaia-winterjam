const { pool } = require('../config/database');

async function addScheduleFields() {
  try {
    console.log('🕐 Adding schedule fields to game_jams table...');

    await pool.query(`
      ALTER TABLE game_jams 
      ADD COLUMN IF NOT EXISTS reception_datetime TIMESTAMP,
      ADD COLUMN IF NOT EXISTS theme_announcement_datetime TIMESTAMP,
      ADD COLUMN IF NOT EXISTS awards_ceremony_datetime TIMESTAMP;
    `);

    console.log('✅ Schedule fields added successfully!');
    console.log('   - reception_datetime');
    console.log('   - theme_announcement_datetime');
    console.log('   - awards_ceremony_datetime');
    
  } catch (error) {
    console.error('❌ Error adding schedule fields:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  addScheduleFields()
    .then(() => {
      console.log('✨ Migration completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addScheduleFields;
