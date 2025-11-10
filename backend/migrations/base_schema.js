const { pool } = require('../config/database');

async function createBaseSchema() {
  try {
    console.log('🔄 Creating base database schema...');

    // Create game_jams table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_jams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        theme TEXT,
        description TEXT,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        registration_start_date TIMESTAMP,
        registration_end_date TIMESTAMP,
        registration_url TEXT,
        rules_pdf_url TEXT,
        is_active BOOLEAN DEFAULT true,
        banner_image_url TEXT,

        -- Homepage content fields
        introduction TEXT DEFAULT 'Uma game jam onde estudantes de desenvolvimento de jogos e entusiastas se juntam para criar experiências únicas em 45 horas. É um evento presencial no IPMAIA com mentores disponíveis, workshops, e muita colaboração. Todos os níveis de experiência são bem-vindos!',
        prizes_content TEXT,
        schedule_content TEXT,

        -- Schedule fields
        reception_datetime TIMESTAMP,
        theme_announcement_datetime TIMESTAMP,
        awards_ceremony_datetime TIMESTAMP,
        evaluation_datetime TIMESTAMP,

        -- Toggle fields
        show_theme BOOLEAN DEFAULT true,
        show_description BOOLEAN DEFAULT true,
        show_start_date BOOLEAN DEFAULT true,
        show_end_date BOOLEAN DEFAULT true,
        date_fallback VARCHAR(255) DEFAULT 'TBD',
        show_registration_dates BOOLEAN DEFAULT true,
        registration_date_fallback VARCHAR(255) DEFAULT 'TBD',
        show_registration_url BOOLEAN DEFAULT true,
        show_rules_pdf_url BOOLEAN DEFAULT true,
        show_banner_image BOOLEAN DEFAULT true,
        banner_fallback VARCHAR(255) DEFAULT 'placeholder',

        -- Custom fields
        custom_fields JSONB DEFAULT '{}',
        custom_fields_visibility JSONB DEFAULT '{}',

        -- Archive fields
        slug VARCHAR(255),
        archive_url TEXT,

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create rules table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rules (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) DEFAULT 'WinterJam Rulebook',
        description TEXT,
        pdf_url TEXT,
        pdf_filename VARCHAR(255),
        version VARCHAR(50) DEFAULT '1.0',
        is_active BOOLEAN DEFAULT true,
        code_of_conduct TEXT,
        guidelines TEXT,
        prizes TEXT,
        judging_criteria TEXT,
        resources TEXT,
        contact_info TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create front_page_settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS front_page_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type VARCHAR(50) DEFAULT 'text',
        display_name VARCHAR(255),
        description TEXT,
        section VARCHAR(100),
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Insert default front page settings
    await pool.query(`
      INSERT INTO front_page_settings (setting_key, setting_value, setting_type, display_name, description, section, display_order)
      VALUES
        ('site_title', 'IPMAIA WinterJam', 'text', 'Site Title', 'Main title displayed on the homepage', 'general', 1),
        ('hero_title', 'WinterJam 2025', 'text', 'Hero Title', 'Main heading in the hero section', 'hero', 1),
        ('hero_subtitle', '45 Hours of Game Development', 'text', 'Hero Subtitle', 'Subtitle under the main hero title', 'hero', 2),
        ('hero_description', 'Join students and game development enthusiasts for an intense 45-hour game jam at IPMAIA. Create unique experiences with mentors, workshops, and collaboration. All skill levels welcome!', 'textarea', 'Hero Description', 'Description text in the hero section', 'hero', 3),
        ('hero_background_filename', NULL, 'text', 'Background Filename', 'Physical filename of the background image stored in backend/uploads/images', 'hero', 99)
      ON CONFLICT (setting_key) DO NOTHING;
    `);

    // Create games table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        gamejam_id INTEGER REFERENCES game_jams(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        team_name VARCHAR(255),
        team_members TEXT[],
        itch_url TEXT,
        screenshots TEXT[],
        video_url TEXT,
        github_url TEXT,
        technologies TEXT[],
        genre VARCHAR(100),
        rating DECIMAL(3,2),
        comments TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Base database schema created successfully!');

  } catch (error) {
    console.error('❌ Error creating base schema:', error);
    throw error;
  }
}

module.exports = {
  up: createBaseSchema
};

// Run migration if called directly
if (require.main === module) {
  createBaseSchema()
    .then(() => {
      console.log('🎉 Base schema migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}