const { pool } = require('../config/database');

async function addBackgroundFilenameField() {
  try {
    console.log('🔄 Adding hero_background_filename field to front_page_settings...');
    
    // Check if the setting already exists
    const checkQuery = `
      SELECT * FROM front_page_settings 
      WHERE setting_key = 'hero_background_filename'
    `;
    
    const checkResult = await pool.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ hero_background_filename field already exists, skipping migration');
      return;
    }
    
    // Add the new setting
    const insertQuery = `
      INSERT INTO front_page_settings 
      (setting_key, setting_value, setting_type, display_name, description, section, display_order)
      VALUES 
      ('hero_background_filename', NULL, 'text', 'Background Filename', 'Physical filename of the background image stored in backend/uploads/images', 'hero', 99)
    `;
    
    await pool.query(insertQuery);
    console.log('✅ hero_background_filename field added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding hero_background_filename field:', error);
    throw error;
  }
}

async function migrate() {
  try {
    await addBackgroundFilenameField();
    console.log('🎉 Background filename field migration completed!');
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

module.exports = addBackgroundFilenameField;
