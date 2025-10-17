require('dotenv').config();
const { pool } = require('../config/database');

/**
 * Migration to add slug and archive_url fields to game_jams table
 */
async function addSlugFields() {
  try {
    console.log('🔄 Adding slug and archive_url fields to game_jams table...');

    // Add slug and archive_url columns if they don't exist
    await pool.query(`
      ALTER TABLE game_jams 
      ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS archive_url VARCHAR(255);
    `);

    console.log('✅ Added slug and archive_url fields!');

    // Auto-generate slugs for existing game jams based on their names
    const result = await pool.query(`
      SELECT id, name, start_date 
      FROM game_jams 
      WHERE slug IS NULL
      ORDER BY id
    `);

    if (result.rows.length > 0) {
      console.log(`🔄 Generating slugs for ${result.rows.length} existing game jams...`);
      
      for (const jam of result.rows) {
        // Create slug from name: "WinterJam 2025" -> "winterjam-2025"
        let slug = jam.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        // Make unique by adding date if needed
        const year = new Date(jam.start_date).getFullYear();
        const month = new Date(jam.start_date).getMonth() + 1; // 1-12
        
        // Determine season based on month
        let season = 'winter';
        if (month >= 3 && month <= 5) season = 'spring';
        else if (month >= 6 && month <= 8) season = 'summer';
        else if (month >= 9 && month <= 11) season = 'fall';
        
        // Check if this slug exists
        const existing = await pool.query(
          'SELECT id FROM game_jams WHERE slug = $1 AND id != $2',
          [slug, jam.id]
        );
        
        // If duplicate, add month to make unique
        if (existing.rows.length > 0) {
          const monthName = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                            'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][month - 1];
          slug = `${slug}-${monthName}`;
        }
        
        const archive_url = `/archive/${year}/${season}/${slug}`;
        
        await pool.query(
          'UPDATE game_jams SET slug = $1, archive_url = $2 WHERE id = $3',
          [slug, archive_url, jam.id]
        );
        
        console.log(`  ✅ ${jam.name} -> ${slug} (${archive_url})`);
      }
    }

    console.log('✅ Slug field migration completed successfully!');
  } catch (error) {
    console.error('❌ Error in slug migration:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  addSlugFields()
    .then(() => {
      console.log('✅ Migration completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addSlugFields;
