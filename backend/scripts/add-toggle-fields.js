require('dotenv').config();
const { pool } = require('../config/database');

/**
 * Migration to add toggle/visibility fields to game_jams and games tables
 * This allows admins to enable/disable various elements with appropriate fallbacks:
 * - Text elements: hide when disabled
 * - Dates: show "TBD" when disabled
 * - Images: show placeholder, hide, or keep when disabled
 * - URLs: hide when disabled
 */
async function addToggleFields() {
  try {
    console.log('🔄 Adding toggle fields to database...');

    // Add toggle fields to game_jams table
    await pool.query(`
      -- Theme toggles
      ALTER TABLE game_jams 
      ADD COLUMN IF NOT EXISTS show_theme BOOLEAN DEFAULT true;
      
      -- Description toggles
      ALTER TABLE game_jams 
      ADD COLUMN IF NOT EXISTS show_description BOOLEAN DEFAULT true;
      
      -- Date toggles with fallback options
      ALTER TABLE game_jams 
      ADD COLUMN IF NOT EXISTS show_start_date BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS show_end_date BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS date_fallback VARCHAR(50) DEFAULT 'TBD';
      -- date_fallback options: 'TBD', 'Coming Soon', 'hidden'
      
      -- Registration date toggles
      ALTER TABLE game_jams 
      ADD COLUMN IF NOT EXISTS show_registration_dates BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS registration_date_fallback VARCHAR(50) DEFAULT 'TBD';
      
      -- URL toggles
      ALTER TABLE game_jams 
      ADD COLUMN IF NOT EXISTS show_registration_url BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS show_rules_pdf_url BOOLEAN DEFAULT true;
      
      -- Banner image toggles with fallback options
      ALTER TABLE game_jams 
      ADD COLUMN IF NOT EXISTS show_banner_image BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS banner_fallback VARCHAR(50) DEFAULT 'placeholder';
      -- banner_fallback options: 'placeholder', 'hide', 'default'
      
      -- Custom fields toggles
      ALTER TABLE game_jams 
      ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS custom_fields_visibility JSONB DEFAULT '{}';
      
      COMMENT ON COLUMN game_jams.show_theme IS 'Toggle to show/hide theme';
      COMMENT ON COLUMN game_jams.show_description IS 'Toggle to show/hide description';
      COMMENT ON COLUMN game_jams.show_start_date IS 'Toggle to show/hide start date';
      COMMENT ON COLUMN game_jams.show_end_date IS 'Toggle to show/hide end date';
      COMMENT ON COLUMN game_jams.date_fallback IS 'Fallback text when dates are disabled (TBD, Coming Soon, hidden)';
      COMMENT ON COLUMN game_jams.show_registration_dates IS 'Toggle to show/hide registration dates';
      COMMENT ON COLUMN game_jams.registration_date_fallback IS 'Fallback text when registration dates are disabled';
      COMMENT ON COLUMN game_jams.show_registration_url IS 'Toggle to show/hide registration URL';
      COMMENT ON COLUMN game_jams.show_rules_pdf_url IS 'Toggle to show/hide rules PDF URL';
      COMMENT ON COLUMN game_jams.show_banner_image IS 'Toggle to show/hide banner image';
      COMMENT ON COLUMN game_jams.banner_fallback IS 'Fallback behavior when banner is disabled (placeholder, hide, default)';
      COMMENT ON COLUMN game_jams.custom_fields IS 'Additional custom fields as JSON';
      COMMENT ON COLUMN game_jams.custom_fields_visibility IS 'Visibility settings for custom fields';
    `);

    // Add toggle fields to games table
    await pool.query(`
      -- Title toggle (rarely disabled but available)
      ALTER TABLE games 
      ADD COLUMN IF NOT EXISTS show_title BOOLEAN DEFAULT true;
      
      -- Description toggle
      ALTER TABLE games 
      ADD COLUMN IF NOT EXISTS show_description BOOLEAN DEFAULT true;
      
      -- Team information toggles
      ALTER TABLE games 
      ADD COLUMN IF NOT EXISTS show_team_name BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS show_team_members BOOLEAN DEFAULT true;
      
      -- URL toggles
      ALTER TABLE games 
      ADD COLUMN IF NOT EXISTS show_github_url BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS show_itch_url BOOLEAN DEFAULT true;
      
      -- Screenshot toggles with fallback
      ALTER TABLE games 
      ADD COLUMN IF NOT EXISTS show_screenshots BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS screenshot_fallback VARCHAR(50) DEFAULT 'placeholder';
      -- screenshot_fallback options: 'placeholder', 'hide', 'default'
      
      -- Tags toggle
      ALTER TABLE games 
      ADD COLUMN IF NOT EXISTS show_tags BOOLEAN DEFAULT true;
      
      -- Thumbnail/cover image toggle
      ALTER TABLE games 
      ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
      ADD COLUMN IF NOT EXISTS show_thumbnail BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS thumbnail_fallback VARCHAR(50) DEFAULT 'placeholder';
      
      -- Additional game metadata with toggles
      ALTER TABLE games 
      ADD COLUMN IF NOT EXISTS instructions TEXT,
      ADD COLUMN IF NOT EXISTS show_instructions BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS lore TEXT,
      ADD COLUMN IF NOT EXISTS show_lore BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS ranking INTEGER,
      ADD COLUMN IF NOT EXISTS show_ranking BOOLEAN DEFAULT true;
      
      -- Custom fields for extensibility
      ALTER TABLE games 
      ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS custom_fields_visibility JSONB DEFAULT '{}';
      
      COMMENT ON COLUMN games.show_title IS 'Toggle to show/hide game title';
      COMMENT ON COLUMN games.show_description IS 'Toggle to show/hide game description';
      COMMENT ON COLUMN games.show_team_name IS 'Toggle to show/hide team name';
      COMMENT ON COLUMN games.show_team_members IS 'Toggle to show/hide team members';
      COMMENT ON COLUMN games.show_github_url IS 'Toggle to show/hide GitHub URL';
      COMMENT ON COLUMN games.show_itch_url IS 'Toggle to show/hide Itch.io URL';
      COMMENT ON COLUMN games.show_screenshots IS 'Toggle to show/hide screenshots';
      COMMENT ON COLUMN games.screenshot_fallback IS 'Fallback behavior for screenshots (placeholder, hide, default)';
      COMMENT ON COLUMN games.show_tags IS 'Toggle to show/hide game tags';
      COMMENT ON COLUMN games.show_thumbnail IS 'Toggle to show/hide thumbnail image';
      COMMENT ON COLUMN games.thumbnail_fallback IS 'Fallback behavior for thumbnail (placeholder, hide, default)';
      COMMENT ON COLUMN games.show_instructions IS 'Toggle to show/hide game instructions';
      COMMENT ON COLUMN games.show_lore IS 'Toggle to show/hide game lore';
      COMMENT ON COLUMN games.show_ranking IS 'Toggle to show/hide game ranking';
      COMMENT ON COLUMN games.custom_fields IS 'Additional custom fields as JSON';
      COMMENT ON COLUMN games.custom_fields_visibility IS 'Visibility settings for custom fields';
    `);

    // Add toggle fields to front_page_settings for better control
    await pool.query(`
      -- Add new settings for front page element toggles
      INSERT INTO front_page_settings (setting_key, setting_value, setting_type, display_name, description, section, display_order) 
      VALUES 
        ('show_hero_title', 'true', 'boolean', 'Show Hero Title', 'Toggle to show/hide hero title', 'hero', 101),
        ('show_hero_description', 'true', 'boolean', 'Show Hero Description', 'Toggle to show/hide hero description', 'hero', 102),
        ('show_hero_background', 'true', 'boolean', 'Show Hero Background', 'Toggle to show/hide hero background image', 'hero', 103),
        ('hero_background_fallback', 'default', 'select', 'Hero Background Fallback', 'Fallback when background is disabled (default, gradient, none)', 'hero', 104),
        ('date_display_format', 'full', 'select', 'Date Display Format', 'How to display dates (full, short, TBD when unavailable)', 'general', 105),
        ('image_placeholder_style', 'gradient', 'select', 'Image Placeholder Style', 'Style for placeholder images (gradient, solid, pattern)', 'general', 106)
      ON CONFLICT (setting_key) DO NOTHING;
    `);

    console.log('✅ Toggle fields added successfully!');
    
    // Update existing records to have default visibility (everything visible)
    await pool.query(`
      UPDATE game_jams SET
        show_theme = COALESCE(show_theme, true),
        show_description = COALESCE(show_description, true),
        show_start_date = COALESCE(show_start_date, true),
        show_end_date = COALESCE(show_end_date, true),
        show_registration_dates = COALESCE(show_registration_dates, true),
        show_registration_url = COALESCE(show_registration_url, true),
        show_rules_pdf_url = COALESCE(show_rules_pdf_url, true),
        show_banner_image = COALESCE(show_banner_image, true),
        date_fallback = COALESCE(date_fallback, 'TBD'),
        registration_date_fallback = COALESCE(registration_date_fallback, 'TBD'),
        banner_fallback = COALESCE(banner_fallback, 'placeholder');
    `);

    await pool.query(`
      UPDATE games SET
        show_title = COALESCE(show_title, true),
        show_description = COALESCE(show_description, true),
        show_team_name = COALESCE(show_team_name, true),
        show_team_members = COALESCE(show_team_members, true),
        show_github_url = COALESCE(show_github_url, true),
        show_itch_url = COALESCE(show_itch_url, true),
        show_screenshots = COALESCE(show_screenshots, true),
        show_tags = COALESCE(show_tags, true),
        show_thumbnail = COALESCE(show_thumbnail, true),
        show_instructions = COALESCE(show_instructions, true),
        show_lore = COALESCE(show_lore, true),
        show_ranking = COALESCE(show_ranking, true),
        screenshot_fallback = COALESCE(screenshot_fallback, 'placeholder'),
        thumbnail_fallback = COALESCE(thumbnail_fallback, 'placeholder');
    `);

    console.log('✅ Existing records updated with default visibility settings!');

  } catch (error) {
    console.error('❌ Error adding toggle fields:', error);
    throw error;
  }
}

async function migrate() {
  try {
    await addToggleFields();
    console.log('🎉 Toggle fields migration completed!');
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

module.exports = { addToggleFields };
