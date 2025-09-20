require('dotenv').config();
const { pool } = require('../config/database');

async function createTables() {
  try {
    console.log('🗄️  Creating database tables...');

    // Create user_sessions table for express-session
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );
      
      CREATE UNIQUE INDEX IF NOT EXISTS session_pkey ON user_sessions(sid);
      CREATE INDEX IF NOT EXISTS session_expire_idx ON user_sessions(expire);
    `);

    // Create users table for admin authentication
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create game_jams table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_jams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        theme VARCHAR(255),
        description TEXT,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        registration_start_date TIMESTAMP,
        registration_end_date TIMESTAMP,
        registration_url TEXT,
        rules_pdf_url TEXT,
        is_active BOOLEAN DEFAULT true,
        banner_image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create games table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        game_jam_id INTEGER REFERENCES game_jams(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        team_name VARCHAR(255) NOT NULL,
        team_members JSONB,
        github_url TEXT,
        itch_url TEXT,
        screenshot_urls JSONB,
        tags JSONB,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_game_jams_active ON game_jams(is_active);
      CREATE INDEX IF NOT EXISTS idx_game_jams_date ON game_jams(start_date);
      CREATE INDEX IF NOT EXISTS idx_games_jam_id ON games(game_jam_id);
      CREATE INDEX IF NOT EXISTS idx_games_featured ON games(is_featured);
    `);

    console.log('✅ Database tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

async function migrate() {
  try {
    await createTables();
    console.log('🎉 Database migration completed!');
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

module.exports = { createTables };