const { pool } = require('../config/database');

class Game {
  static async create(data) {
    const {
      game_jam_id,
      title,
      description,
      team_name,
      team_members,
      github_url,
      itch_url,
      screenshot_urls,
      tags,
      is_featured,
      // New fields from migration
      thumbnail_url,
      instructions,
      lore,
      ranking,
      // Toggle fields
      show_title = true,
      show_description = true,
      show_team_name = true,
      show_team_members = true,
      show_github_url = true,
      show_itch_url = true,
      show_screenshots = true,
      screenshot_fallback = 'placeholder',
      show_tags = true,
      show_thumbnail = true,
      thumbnail_fallback = 'placeholder',
      show_instructions = true,
      show_lore = true,
      show_ranking = true,
      custom_fields = {},
      custom_fields_visibility = {}
    } = data;

    // Convert arrays to JSON strings for PostgreSQL JSON columns
    const processedTeamMembers = Array.isArray(team_members) ? JSON.stringify(team_members) : team_members;
    const processedTags = Array.isArray(tags) ? JSON.stringify(tags) : tags;
    const processedScreenshotUrls = Array.isArray(screenshot_urls) ? JSON.stringify(screenshot_urls) : screenshot_urls;

    const query = `
      INSERT INTO games (
        game_jam_id, title, description, team_name, team_members,
        github_url, itch_url, screenshot_urls, tags, is_featured,
        thumbnail_url, instructions, lore, ranking,
        show_title, show_description, show_team_name, show_team_members,
        show_github_url, show_itch_url, show_screenshots, screenshot_fallback,
        show_tags, show_thumbnail, thumbnail_fallback, show_instructions,
        show_lore, show_ranking, custom_fields, custom_fields_visibility,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      game_jam_id, title, description, team_name, processedTeamMembers,
      github_url, itch_url, processedScreenshotUrls, processedTags, is_featured,
      thumbnail_url, instructions, lore, ranking,
      show_title, show_description, show_team_name, show_team_members,
      show_github_url, show_itch_url, show_screenshots, screenshot_fallback,
      show_tags, show_thumbnail, thumbnail_fallback, show_instructions,
      show_lore, show_ranking, JSON.stringify(custom_fields), JSON.stringify(custom_fields_visibility)
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT g.*, gj.name as game_jam_name, gj.theme as game_jam_theme
      FROM games g
      JOIN game_jams gj ON g.game_jam_id = gj.id
      ORDER BY g.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT g.*, gj.name as game_jam_name, gj.theme as game_jam_theme
      FROM games g
      JOIN game_jams gj ON g.game_jam_id = gj.id
      WHERE g.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByGameJam(gameJamId) {
    const query = `
      SELECT * FROM games 
      WHERE game_jam_id = $1 
      ORDER BY is_featured DESC, created_at DESC
    `;
    const result = await pool.query(query, [gameJamId]);
    return result.rows;
  }

  static async findFeatured(limit = 6) {
    const query = `
      SELECT g.*, gj.name as game_jam_name, gj.theme as game_jam_theme
      FROM games g
      JOIN game_jams gj ON g.game_jam_id = gj.id
      WHERE g.is_featured = true
      ORDER BY g.created_at DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  static async update(id, data) {
    console.log('🔄 Game.update - ID:', id);
    console.log('🔄 Game.update - Data:', JSON.stringify(data, null, 2));
    
    const fields = [];
    const values = [];
    let index = 1;

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        let value = data[key];
        
        // Convert arrays to JSON strings for PostgreSQL JSON columns
        if (key === 'team_members' || key === 'tags' || key === 'screenshot_urls') {
          if (Array.isArray(value)) {
            value = JSON.stringify(value);
            console.log(`🔄 Converting ${key} array to JSON:`, value);
          }
        }
        
        // Convert objects to JSON strings for custom fields
        if (key === 'custom_fields' || key === 'custom_fields_visibility') {
          if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
            console.log(`🔄 Converting ${key} object to JSON:`, value);
          }
        }
        
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE games 
      SET ${fields.join(', ')} 
      WHERE id = $${index}
      RETURNING *
    `;

    console.log('🔄 Game.update - Query:', query);
    console.log('🔄 Game.update - Values:', values);

    try {
      const result = await pool.query(query, values);
      console.log('✅ Game.update - Success:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Game.update - Database error:', error);
      console.error('❌ Game.update - Query:', query);
      console.error('❌ Game.update - Values:', values);
      throw error;
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM games WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async search(searchTerm) {
    const query = `
      SELECT g.*, gj.name as game_jam_name, gj.theme as game_jam_theme
      FROM games g
      JOIN game_jams gj ON g.game_jam_id = gj.id
      WHERE 
        g.title ILIKE $1 OR 
        g.description ILIKE $1 OR 
        g.team_name ILIKE $1 OR
        g.tags::text ILIKE $1
      ORDER BY g.created_at DESC
    `;
    const result = await pool.query(query, [`%${searchTerm}%`]);
    return result.rows;
  }
}

module.exports = Game;