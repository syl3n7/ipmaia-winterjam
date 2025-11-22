const { pool } = require('../config/database');

async function createSponsorsTable() {
  try {
    console.log('🔄 Creating sponsors table...');

    // Create sponsors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sponsors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        tier VARCHAR(50) NOT NULL CHECK (tier IN ('platinum', 'gold', 'silver', 'bronze')),
        logo_url TEXT,
        website_url TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Insert default sponsor (IPMAIA)
    await pool.query(`
      INSERT INTO sponsors (name, tier, logo_url, website_url, description, is_active)
      VALUES (
        'IPMAIA',
        'platinum',
        '/images/ipmaia-logo.png',
        'https://ipmaia.pt',
        'Instituto Politécnico da Maia - Patrocinador principal do WinterJam',
        true
      )
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log('✅ Sponsors table created successfully!');

  } catch (error) {
    console.error('❌ Error creating sponsors table:', error);
    throw error;
  }
}

module.exports = {
  up: createSponsorsTable
};

// Run migration if called directly
if (require.main === module) {
  createSponsorsTable()
    .then(() => {
      console.log('🎉 Sponsors table migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}