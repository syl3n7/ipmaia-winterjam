const { pool } = require('../config/database');

class Rules {
  // Get the active rulebook
  static async getActive() {
    const query = `
      SELECT *
      FROM rules
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await pool.query(query);
    return result.rows[0] || null;
  }

  // Get all rulebooks (admin)
  static async getAll() {
    const query = `
      SELECT *
      FROM rules
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Get rulebook by ID
  static async getById(id) {
    const query = `
      SELECT *
      FROM rules
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Create new rulebook
  static async create(data) {
    const {
      title = 'WinterJam Rulebook',
      description = '',
      pdf_url,
      version = '1.0',
      is_active = true
    } = data;

    // If setting as active, deactivate all others first
    if (is_active) {
      await pool.query('UPDATE rules SET is_active = false');
    }

    const query = `
      INSERT INTO rules (title, description, pdf_url, version, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(query, [
      title,
      description,
      pdf_url,
      version,
      is_active
    ]);

    return result.rows[0];
  }

  // Update rulebook
  static async update(id, data) {
    const {
      title,
      description,
      pdf_url,
      version,
      is_active
    } = data;

    // If setting as active, deactivate all others first
    if (is_active) {
      await pool.query('UPDATE rules SET is_active = false WHERE id != $1', [id]);
    }

    const query = `
      UPDATE rules
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        pdf_url = COALESCE($3, pdf_url),
        version = COALESCE($4, version),
        is_active = COALESCE($5, is_active),
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;

    const result = await pool.query(query, [
      title,
      description,
      pdf_url,
      version,
      is_active,
      id
    ]);

    return result.rows[0] || null;
  }

  // Delete rulebook
  static async delete(id) {
    const query = `
      DELETE FROM rules
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Set active rulebook
  static async setActive(id) {
    // Deactivate all
    await pool.query('UPDATE rules SET is_active = false');
    
    // Activate the selected one
    const query = `
      UPDATE rules
      SET is_active = true,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = Rules;
