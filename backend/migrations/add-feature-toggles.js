const { pool } = require('../config/database');

async function addFeatureToggles() {
  try {
    console.log('🔄 Adding feature toggle settings...');

    // Insert new feature toggle settings
    await pool.query(`
      INSERT INTO front_page_settings (setting_key, setting_value, setting_type, display_name, description, section, display_order)
      VALUES
        ('enable_raffle_wheel', 'false', 'boolean', 'Enable Raffle Wheel', 'Enable or disable the raffle wheel feature', 'features', 1),
        ('enable_jam_themes', 'false', 'boolean', 'Enable Jam Themes', 'Enable or disable the jam themes feature', 'features', 2),
        ('enable_forms', 'false', 'boolean', 'Enable Forms', 'Enable or disable the forms feature', 'features', 3)
      ON CONFLICT (setting_key) DO NOTHING;
    `);

    console.log('✅ Feature toggle settings added successfully!');

  } catch (error) {
    console.error('❌ Error adding feature toggles:', error);
    throw error;
  }
}

module.exports = {
  up: addFeatureToggles
};

// Run migration if called directly
if (require.main === module) {
  addFeatureToggles()
    .then(() => {
      console.log('🎉 Feature toggles migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}