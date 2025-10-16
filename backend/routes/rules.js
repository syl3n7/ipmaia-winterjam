const express = require('express');
const { pool } = require('../config/database');
const { requireAdmin } = require('./auth');

const router = express.Router();

// Public route - Get all active rules content
router.get('/content', async (req, res) => {
  try {
    const query = `
      SELECT section_key, section_title, content, display_order
      FROM rules_content
      WHERE is_active = true
      ORDER BY display_order ASC
    `;
    const result = await pool.query(query);
    
    // Convert to key-value object for easier access
    const rulesContent = {};
    result.rows.forEach(row => {
      rulesContent[row.section_key] = {
        title: row.section_title,
        content: row.content,
        order: row.display_order
      };
    });
    
    res.json(rulesContent);
  } catch (error) {
    console.error('Error fetching rules content:', error);
    res.status(500).json({ error: 'Failed to fetch rules content' });
  }
});

// Admin routes - require authentication
router.use(requireAdmin);

// Get all rules content (including inactive)
router.get('/admin/content', async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM rules_content
      ORDER BY display_order ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admin rules content:', error);
    res.status(500).json({ error: 'Failed to fetch rules content' });
  }
});

// Update specific rule section
router.put('/admin/content/:sectionKey', async (req, res) => {
  try {
    const { sectionKey } = req.params;
    const { section_title, content } = req.body;
    
    const query = `
      UPDATE rules_content
      SET section_title = $1,
          content = $2,
          updated_at = NOW()
      WHERE section_key = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [section_title, content, sectionKey]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rule section not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating rules content:', error);
    res.status(500).json({ error: 'Failed to update rules content' });
  }
});

// Bulk update all sections
router.put('/admin/content', async (req, res) => {
  try {
    const { sections } = req.body;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const updatedSections = [];
      for (const section of sections) {
        const query = `
          UPDATE rules_content
          SET section_title = $1,
              content = $2,
              updated_at = NOW()
          WHERE section_key = $3
          RETURNING *
        `;
        
        const result = await client.query(query, [
          section.section_title,
          section.content,
          section.section_key
        ]);
        
        if (result.rows.length > 0) {
          updatedSections.push(result.rows[0]);
        }
      }
      
      await client.query('COMMIT');
      res.json({ updated: updatedSections.length, sections: updatedSections });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error bulk updating rules content:', error);
    res.status(500).json({ error: 'Failed to update rules content' });
  }
});

module.exports = router;
