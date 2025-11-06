const { pool } = require('../config/database');

async function addPdfFilenameColumn() {
  try {
    console.log('🔄 Adding pdf_filename column to rules table...');
    
    // Check if column already exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'rules' 
      AND column_name = 'pdf_filename';
    `;
    
    const checkResult = await pool.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Column pdf_filename already exists, skipping migration');
      return;
    }
    
    // Add the column
    const alterQuery = `
      ALTER TABLE rules 
      ADD COLUMN pdf_filename VARCHAR(255);
    `;
    
    await pool.query(alterQuery);
    console.log('✅ Column pdf_filename added successfully!');
    
    // Add comment to the column for documentation
    const commentQuery = `
      COMMENT ON COLUMN rules.pdf_filename IS 'Physical filename of the PDF stored in backend/uploads/pdfs';
    `;
    
    await pool.query(commentQuery);
    console.log('✅ Column comment added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding pdf_filename column:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  addPdfFilenameColumn()
    .then(() => {
      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addPdfFilenameColumn;
