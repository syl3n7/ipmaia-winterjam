const { pool } = require('../config/database');

async function migrateRules() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting rules table migration...');

    // Create rules table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rules (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL DEFAULT 'WinterJam Rulebook',
        description TEXT,
        pdf_url VARCHAR(512) NOT NULL,
        version VARCHAR(50) DEFAULT '1.0',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    console.log('✅ Rules table created successfully');

    // Check if we already have data
    const checkResult = await client.query('SELECT COUNT(*) FROM rules');
    const count = parseInt(checkResult.rows[0].count);

    if (count === 0) {
      console.log('📝 Inserting default rulebook...');
      
      await client.query(`
        INSERT INTO rules (title, description, pdf_url, version, is_active)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        'WinterJam 2025 Rulebook',
        'Livro de regras oficial da WinterJam 2025',
        '/WinterJam_Rulebook.pdf',
        '1.0',
        true
      ]);
      
      console.log('✅ Default rulebook inserted');
    } else {
      console.log(`ℹ️  Rules table already contains ${count} record(s)`);
    }

    // Drop old rules_content table if it exists
    await client.query('DROP TABLE IF EXISTS rules_content CASCADE');
    console.log('🗑️  Removed old rules_content table');

    console.log('✅ Rules migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during rules migration:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  migrateRules()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateRules;
