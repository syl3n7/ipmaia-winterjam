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
      // Homepage content fields
      introduction = 'Uma game jam onde estudantes de desenvolvimento de jogos e entusiastas se juntam para criar experiências únicas em 45 horas. É um evento presencial no IPMAIA com mentores disponíveis, workshops, e muita colaboração. Todos os níveis de experiência são bem-vindos!',
      prizes_content = null,
      schedule_content = null,
      // Schedule fields
      reception_datetime = null,
      theme_announcement_datetime = null,
      awards_ceremony_datetime = null,
      evaluation_datetime = null,
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
        introduction, prizes_content, schedule_content,
        reception_datetime, theme_announcement_datetime, awards_ceremony_datetime, evaluation_datetime,
        show_theme, show_description, show_start_date, show_end_date,
        date_fallback, show_registration_dates, registration_date_fallback,
        show_registration_url, show_rules_pdf_url, show_banner_image,
        banner_fallback, custom_fields, custom_fields_visibility,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      name, theme, description, start_date, end_date,
      registration_start_date, registration_end_date, registration_url,
      rules_pdf_url, is_active, banner_image_url,
      introduction, prizes_content, schedule_content,
      reception_datetime, theme_announcement_datetime, awards_ceremony_datetime, evaluation_datetime,
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
    console.log('🔄 GameJam.update - ID:', id);
    console.log('🔄 GameJam.update - Data:', JSON.stringify(data, null, 2));
    
    const fields = [];
    const values = [];
    let index = 1;

    // Date field names that should convert empty strings to null
    const dateFields = [
      'start_date', 'end_date', 
      'registration_start_date', 'registration_end_date',
      'reception_datetime', 'theme_announcement_datetime', 'awards_ceremony_datetime', 'evaluation_datetime'
    ];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        let value = data[key];
        
        // Convert empty strings to null for date/timestamp fields
        if (dateFields.includes(key) && value === '') {
          value = null;
          console.log(`🔄 Converting empty ${key} to NULL`);
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
        console.log(`📝 Field ${index}: ${key} = ${value} (type: ${typeof value})`);
        index++;
      }
    });

    if (fields.length === 0) {
      console.log('⚠️ No fields to update');
      return null;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE game_jams 
      SET ${fields.join(', ')} 
      WHERE id = $${index}
      RETURNING *
    `;

    console.log('🔄 GameJam.update - Query:', query);
    console.log('🔄 GameJam.update - Values:', values);

    try {
      const result = await pool.query(query, values);
      console.log('✅ GameJam.update - Success:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ GameJam.update - Database error:', error);
      console.error('❌ GameJam.update - Query:', query);
      console.error('❌ GameJam.update - Values:', values);
      throw error;
    }
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