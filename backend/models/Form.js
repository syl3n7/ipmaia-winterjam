const { pool } = require('../config/database');

class Form {
  /**
   * Create a new form.
   * @param {object} data
   * @returns {object} created form row
   */
  static async create(data) {
    const {
      name,
      slug,
      description = null,
      fields = [],
      notification_email = null,
      success_message = 'Thank you for your submission!',
      submit_button_text = 'Submit',
      status = 'draft',
      gamejam_id = null,
      settings = {},
    } = data;

    const result = await pool.query(
      `INSERT INTO forms
         (name, slug, description, fields, notification_email, success_message,
          submit_button_text, status, gamejam_id, settings, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())
       RETURNING *`,
      [
        name,
        slug,
        description,
        JSON.stringify(fields),
        notification_email,
        success_message,
        submit_button_text,
        status,
        gamejam_id || null,
        JSON.stringify(settings),
      ]
    );
    return result.rows[0];
  }

  /**
   * List all forms with submission counts.
   */
  static async findAll() {
    const result = await pool.query(`
      SELECT f.*,
             gj.name AS gamejam_name,
             COALESCE(s.submission_count, 0)::INTEGER AS submission_count
      FROM forms f
      LEFT JOIN game_jams gj ON gj.id = f.gamejam_id
      LEFT JOIN (
        SELECT form_id, COUNT(*) AS submission_count
        FROM form_submissions
        GROUP BY form_id
      ) s ON s.form_id = f.id
      ORDER BY f.created_at DESC
    `);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT f.*,
              gj.name AS gamejam_name,
              COALESCE(s.submission_count, 0)::INTEGER AS submission_count
       FROM forms f
       LEFT JOIN game_jams gj ON gj.id = f.gamejam_id
       LEFT JOIN (
         SELECT form_id, COUNT(*) AS submission_count
         FROM form_submissions
         GROUP BY form_id
       ) s ON s.form_id = f.id
       WHERE f.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findBySlug(slug) {
    const result = await pool.query(
      `SELECT f.*, gj.name AS gamejam_name
       FROM forms f
       LEFT JOIN game_jams gj ON gj.id = f.gamejam_id
       WHERE f.slug = $1`,
      [slug]
    );
    return result.rows[0] || null;
  }

  static async findByGameJam(gamejamId) {
    const result = await pool.query(
      'SELECT * FROM forms WHERE gamejam_id = $1 ORDER BY created_at DESC',
      [gamejamId]
    );
    return result.rows;
  }

  static async update(id, data) {
    const ALLOWED = new Set([
      'name', 'slug', 'description', 'fields', 'notification_email',
      'success_message', 'submit_button_text', 'status', 'gamejam_id', 'settings',
    ]);

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (!ALLOWED.has(key)) continue;
      let v = value;
      if (key === 'fields' || key === 'settings') {
        v = typeof v === 'string' ? v : JSON.stringify(v);
      }
      if (key === 'gamejam_id') {
        v = v === '' || v === 0 ? null : v;
      }
      setClauses.push(`${key} = $${paramIndex}`);
      values.push(v);
      paramIndex++;
    }

    if (setClauses.length === 0) return this.findById(id);

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE forms SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM forms WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = Form;
