const { pool } = require('../config/database');

class FormSubmission {
  static async create({ form_id, data, ip_address }) {
    const result = await pool.query(
      `INSERT INTO form_submissions (form_id, data, ip_address)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [form_id, JSON.stringify(data), ip_address || null]
    );
    return result.rows[0];
  }

  static async findByForm(formId) {
    const result = await pool.query(
      `SELECT fs.*, g.title AS game_title
       FROM form_submissions fs
       LEFT JOIN games g ON g.id = fs.game_id
       WHERE fs.form_id = $1
       ORDER BY fs.submitted_at DESC`,
      [formId]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT fs.*, g.title AS game_title
       FROM form_submissions fs
       LEFT JOIN games g ON g.id = fs.game_id
       WHERE fs.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM form_submissions WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0] || null;
  }

  static async markProcessed(id, game_id, notes) {
    const result = await pool.query(
      `UPDATE form_submissions
       SET processed = true, game_id = $2, notes = $3
       WHERE id = $1
       RETURNING *`,
      [id, game_id || null, notes || null]
    );
    return result.rows[0] || null;
  }
}

module.exports = FormSubmission;
