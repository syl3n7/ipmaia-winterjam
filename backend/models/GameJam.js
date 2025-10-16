const { pool } = require('../config/database');

class GameJam {
  static async create(data) {
    const {
      name,
      theme,
      description,
      start_date,
      end_date,
      registration_start_date,
      registration_end_date,
      registration_url,
      rules_pdf_url,
      is_active,
      banner_image_url,
      // Toggle fields
      show_theme = true,
      show_description = true,
      show_start_date = true,
      show_end_date = true,
      date_fallback = 'TBD',
      show_registration_dates = true,
      registration_date_fallback = 'TBD',
      show_registration_url = true,
      show_rules_pdf_url = true,
      show_banner_image = true,
      banner_fallback = 'placeholder',
      custom_fields = {},
      custom_fields_visibility = {}
    } = data;

    const query = `
      INSERT INTO game_jams (
        name, theme, description, start_date, end_date,
        registration_start_date, registration_end_date, registration_url,
        rules_pdf_url, is_active, banner_image_url,
        show_theme, show_description, show_start_date, show_end_date,
        date_fallback, show_registration_dates, registration_date_fallback,
        show_registration_url, show_rules_pdf_url, show_banner_image,
        banner_fallback, custom_fields, custom_fields_visibility,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      name, theme, description, start_date, end_date,
      registration_start_date, registration_end_date, registration_url,
      rules_pdf_url, is_active, banner_image_url,
      show_theme, show_description, show_start_date, show_end_date,
      date_fallback, show_registration_dates, registration_date_fallback,
      show_registration_url, show_rules_pdf_url, show_banner_image,
      banner_fallback, JSON.stringify(custom_fields), JSON.stringify(custom_fields_visibility)
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(includeInactive = false) {
    const query = includeInactive 
      ? 'SELECT * FROM game_jams ORDER BY start_date DESC'
      : 'SELECT * FROM game_jams WHERE is_active = true ORDER BY start_date DESC';
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM game_jams WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByYear(year) {
    const query = `
      SELECT * FROM game_jams 
      WHERE EXTRACT(YEAR FROM start_date) = $1 
      ORDER BY start_date DESC
    `;
    const result = await pool.query(query, [year]);
    return result.rows;
  }

  static async findByYearAndSeason(year, season) {
    const query = `
      SELECT * FROM game_jams 
      WHERE EXTRACT(YEAR FROM start_date) = $1 
      AND LOWER(name) LIKE $2
      ORDER BY start_date DESC
    `;
    const result = await pool.query(query, [year, `%${season.toLowerCase()}%`]);
    return result.rows;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let index = 1;

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${index}`);
        values.push(data[key]);
        index++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE game_jams 
      SET ${fields.join(', ')} 
      WHERE id = $${index}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM game_jams WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getActive() {
    const query = `
      SELECT * FROM game_jams 
      WHERE is_active = true 
      AND NOW() BETWEEN registration_start_date AND registration_end_date
      ORDER BY start_date ASC
      LIMIT 1
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = GameJam;