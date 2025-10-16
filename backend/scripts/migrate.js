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

    // Create game_jams table with toggle fields
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
        -- Toggle fields for visibility control
        show_theme BOOLEAN DEFAULT true,
        show_description BOOLEAN DEFAULT true,
        show_start_date BOOLEAN DEFAULT true,
        show_end_date BOOLEAN DEFAULT true,
        date_fallback VARCHAR(50) DEFAULT 'TBD',
        show_registration_dates BOOLEAN DEFAULT true,
        registration_date_fallback VARCHAR(50) DEFAULT 'TBD',
        show_registration_url BOOLEAN DEFAULT true,
        show_rules_pdf_url BOOLEAN DEFAULT true,
        show_banner_image BOOLEAN DEFAULT true,
        banner_fallback VARCHAR(50) DEFAULT 'placeholder',
        custom_fields JSONB DEFAULT '{}',
        custom_fields_visibility JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create games table with toggle fields
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
        -- Additional fields
        thumbnail_url TEXT,
        instructions TEXT,
        lore TEXT,
        ranking INTEGER,
        -- Toggle fields for visibility control
        show_title BOOLEAN DEFAULT true,
        show_description BOOLEAN DEFAULT true,
        show_team_name BOOLEAN DEFAULT true,
        show_team_members BOOLEAN DEFAULT true,
        show_github_url BOOLEAN DEFAULT true,
        show_itch_url BOOLEAN DEFAULT true,
        show_screenshots BOOLEAN DEFAULT true,
        screenshot_fallback VARCHAR(50) DEFAULT 'placeholder',
        show_tags BOOLEAN DEFAULT true,
        show_thumbnail BOOLEAN DEFAULT true,
        thumbnail_fallback VARCHAR(50) DEFAULT 'placeholder',
        show_instructions BOOLEAN DEFAULT true,
        show_lore BOOLEAN DEFAULT true,
        show_ranking BOOLEAN DEFAULT true,
        custom_fields JSONB DEFAULT '{}',
        custom_fields_visibility JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create front_page_settings table for admin-controlled front page content
    await pool.query(`
      CREATE TABLE IF NOT EXISTS front_page_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type VARCHAR(50) DEFAULT 'text',
        display_name VARCHAR(255) NOT NULL,
        description TEXT,
        section VARCHAR(100) DEFAULT 'general',
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Insert default front page settings
    await pool.query(`
      INSERT INTO front_page_settings (setting_key, setting_value, setting_type, display_name, description, section, display_order) 
      VALUES 
        ('hero_title', 'IPMAIA WinterJam 2025', 'text', 'Hero Title', 'Main title displayed on the front page', 'hero', 1),
        ('hero_description', 'Uma game jam onde estudantes de desenvolvimento de jogos criam experiências únicas em 45 horas.', 'textarea', 'Hero Description', 'Description text below the main title', 'hero', 2),
        ('hero_background_image', '/images/IPMAIA_SiteBanner.png', 'image', 'Background Image', 'Hero section background image URL', 'hero', 3),
        ('show_event_dates', 'true', 'boolean', 'Show Event Dates', 'Display event start and end dates', 'general', 4),
        ('show_theme', 'true', 'boolean', 'Show Theme', 'Display the game jam theme when available', 'general', 5),
        ('show_required_object', 'true', 'boolean', 'Show Required Object', 'Display the required object when available', 'general', 6),
        ('button_before_start_text', 'Inscrever Agora', 'text', 'Pre-Event Button Text', 'Button text before event starts', 'buttons', 7),
        ('button_before_start_url', '/enlist-now', 'url', 'Pre-Event Button URL', 'Button URL before event starts', 'buttons', 8),
        ('button_during_event_text', 'Ver Regras', 'text', 'During Event Button Text', 'Button text during event', 'buttons', 9),
        ('button_during_event_url', '/rules', 'url', 'During Event Button URL', 'Button URL during event', 'buttons', 10),
        ('button_after_event_text', 'Ver Jogos Submetidos', 'text', 'Post-Event Button Text', 'Button text after event ends', 'buttons', 11),
        ('button_after_event_url', '/archive/2025/winter', 'url', 'Post-Event Button URL', 'Button URL after event ends', 'buttons', 12),
        ('status_event_running', 'Evento a decorrer!', 'text', 'Event Running Status', 'Message displayed when event is active', 'advanced', 13),
        ('status_fallback_message', 'Mantém-te atento às nossas redes sociais para updates sobre o próximo Winter Jam!', 'textarea', 'Fallback Status Message', 'Message displayed when no event is running', 'advanced', 14),
        ('custom_css', '', 'textarea', 'Custom CSS', 'Additional CSS styles for the front page', 'advanced', 15),
        ('analytics_code', '', 'textarea', 'Analytics Code', 'Google Analytics or other tracking code', 'advanced', 16)
      ON CONFLICT (setting_key) DO NOTHING;
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_game_jams_active ON game_jams(is_active);
      CREATE INDEX IF NOT EXISTS idx_game_jams_date ON game_jams(start_date);
      CREATE INDEX IF NOT EXISTS idx_games_jam_id ON games(game_jam_id);
      CREATE INDEX IF NOT EXISTS idx_games_featured ON games(is_featured);
      CREATE INDEX IF NOT EXISTS idx_front_page_settings_key ON front_page_settings(setting_key);
      CREATE INDEX IF NOT EXISTS idx_front_page_settings_section ON front_page_settings(section);
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