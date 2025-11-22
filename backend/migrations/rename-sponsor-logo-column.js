const { pool } = require('../config/database');

async function renameLogoUrlToLogoFilename() {
  try {
    console.log('🔄 Renaming logo_url column to logo_filename...');

    // Check if logo_url column exists and logo_filename doesn't
    const columnsResult = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'sponsors' AND column_name IN ('logo_url', 'logo_filename')
    `);

    const columns = columnsResult.rows.map(row => row.column_name);

    if (columns.includes('logo_url') && !columns.includes('logo_filename')) {
      // Rename the column
      await pool.query(`
        ALTER TABLE sponsors RENAME COLUMN logo_url TO logo_filename
      `);
      console.log('✅ Column renamed from logo_url to logo_filename');
    } else if (columns.includes('logo_filename')) {
      console.log('ℹ️ logo_filename column already exists');
    } else {
      console.log('⚠️ Neither logo_url nor logo_filename column found');
    }

  } catch (error) {
    console.error('❌ Error renaming logo column:', error);
    throw error;
  }
}

module.exports = {
  up: renameLogoUrlToLogoFilename
};

// Run migration if called directly
if (require.main === module) {
  renameLogoUrlToLogoFilename()
    .then(() => {
      console.log('🎉 Logo column rename migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}