const { pool } = require('../config/database');

async function addJamSponsorSettings() {
  try {
    console.log('🏁 Adding jam sponsor settings to game_jams table...');

    await pool.query(`
      ALTER TABLE game_jams
      ADD COLUMN IF NOT EXISTS sponsor_settings JSONB DEFAULT '{}'
    `);

    console.log('✅ Jam sponsor settings added successfully!');
  } catch (error) {
    console.error('❌ Error adding jam sponsor settings:', error);
    throw error;
  }
}

if (require.main === module) {
  addJamSponsorSettings()
    .then(() => {
      console.log('✨ Migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addJamSponsorSettings;
