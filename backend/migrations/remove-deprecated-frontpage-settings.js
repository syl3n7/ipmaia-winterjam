const { pool } = require('../config/database');

async function removeDeprecatedFrontPageSettings() {
  try {
    console.log('🔄 Removing deprecated front page settings...');
    
    // These fields are now managed in the Game Jam section
    const deprecatedSettings = [
      'hero_title',
      'hero_description',
      'show_event_dates',
      'show_theme',
      'show_required_object',
      'status_event_running'
    ];
    
    const result = await pool.query(`
      DELETE FROM front_page_settings 
      WHERE setting_key = ANY($1)
      RETURNING setting_key
    `, [deprecatedSettings]);
    
    console.log(`✅ Removed ${result.rows.length} deprecated settings:`, result.rows.map(r => r.setting_key));
    
  } catch (error) {
    console.error('❌ Error removing deprecated settings:', error);
    throw error;
  }
}

async function migrate() {
  try {
    await removeDeprecatedFrontPageSettings();
    console.log('🎉 Deprecated settings migration completed!');
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

module.exports = removeDeprecatedFrontPageSettings;
