const express = require('express');
const { pool } = require('../config/database');
const { requireAdmin } = require('./auth');
const router = express.Router();

// Get all front page settings (public endpoint)
router.get('/settings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT setting_key, setting_value, setting_type 
      FROM front_page_settings 
      ORDER BY sort_order, setting_key
    `);
    
    // Convert to key-value object for easier frontend use
    const settings = {};
    result.rows.forEach(row => {
      let value = row.setting_value;
      
      // Convert boolean strings to actual booleans
      if (row.setting_type === 'boolean') {
        value = value === 'true';
      }
      
      settings[row.setting_key] = value;
    });
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching front page settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get settings for admin (with metadata)
router.get('/admin/settings', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM front_page_settings 
      ORDER BY section, sort_order, setting_key
    `);
    
    // Group by section for better admin UI organization
    const settingsBySection = {};
    result.rows.forEach(setting => {
      const section = setting.section || 'general';
      if (!settingsBySection[section]) {
        settingsBySection[section] = [];
      }
      settingsBySection[section].push(setting);
    });
    
    res.json(settingsBySection);
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({ error: 'Failed to fetch admin settings' });
  }
});

// Update a setting (admin only)
router.put('/admin/settings/:key', requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const result = await pool.query(`
      UPDATE front_page_settings 
      SET setting_value = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE setting_key = $2 
      RETURNING *
    `, [value, key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// Bulk update settings (admin only)
router.put('/admin/settings', requireAdmin, async (req, res) => {
  try {
    const { settings } = req.body;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const updatedSettings = [];
      for (const [key, value] of Object.entries(settings)) {
        const result = await client.query(`
          UPDATE front_page_settings 
          SET setting_value = $1, updated_at = CURRENT_TIMESTAMP 
          WHERE setting_key = $2 
          RETURNING *
        `, [value, key]);
        
        if (result.rows.length > 0) {
          updatedSettings.push(result.rows[0]);
        }
      }
      
      await client.query('COMMIT');
      res.json({ 
        message: 'Settings updated successfully', 
        updated: updatedSettings.length,
        settings: updatedSettings 
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error bulk updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Reset settings to defaults (admin only)
router.post('/admin/settings/reset', requireAdmin, async (req, res) => {
  try {
    // This would re-run the default inserts from the migration
    // For now, we'll just return a message
    res.json({ message: 'Reset functionality would go here' });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

module.exports = router;