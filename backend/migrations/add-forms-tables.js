const { pool } = require('../config/database');

async function addFormsTables() {
  try {
    console.log('🔄 Creating forms tables...');

    // Create forms table — fields stored as JSONB array, no separate fields table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS forms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        fields JSONB DEFAULT '[]',
        notification_email VARCHAR(255),
        success_message TEXT DEFAULT 'Thank you for your submission!',
        submit_button_text VARCHAR(255) DEFAULT 'Submit',
        status VARCHAR(50) DEFAULT 'draft',
        gamejam_id INTEGER REFERENCES game_jams(id) ON DELETE SET NULL,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create form_submissions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS form_submissions (
        id SERIAL PRIMARY KEY,
        form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
        data JSONB NOT NULL,
        submitted_at TIMESTAMP DEFAULT NOW(),
        ip_address INET,
        game_id INTEGER REFERENCES games(id) ON DELETE SET NULL,
        processed BOOLEAN DEFAULT false,
        notes TEXT
      );
    `);

    // Add registration_form_id to game_jams (FK → forms, so forms must exist first)
    await pool.query(`
      ALTER TABLE game_jams
        ADD COLUMN IF NOT EXISTS registration_form_id INTEGER REFERENCES forms(id) ON DELETE SET NULL;
    `);

    console.log('✅ Forms tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating forms tables:', error);
    throw error;
  }
}

module.exports = { up: addFormsTables };

if (require.main === module) {
  addFormsTables()
    .then(() => { console.log('🎉 Forms migration done!'); process.exit(0); })
    .catch((err) => { console.error('💥 Migration failed:', err); process.exit(1); });
}
