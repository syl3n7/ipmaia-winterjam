const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const rateLimit = require('express-rate-limit');
const { pool } = require('../config/database');
const { requireAdmin } = require('./auth');
const router = express.Router();

// Rate limiter for image uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: 'Too many upload attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.connection.remoteAddress || '0.0.0.0';
    return ip.split(':')[0];
  }
});

// Configure multer for background image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/images');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `background_${timestamp}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  }
});

// Get all front page settings (public endpoint)
router.get('/settings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT setting_key, setting_value, setting_type 
      FROM front_page_settings 
      ORDER BY display_order, setting_key
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
      ORDER BY section, display_order, setting_key
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

// Upload background image (admin only)
router.post('/admin/upload-background', requireAdmin, uploadLimiter, upload.single('image'), async (req, res) => {
  console.log('📤 Upload background endpoint hit');
  console.log('👤 User session:', req.session?.userId, req.session?.email);
  console.log('📁 File received:', req.file ? 'Yes' : 'No');
  
  try {
    if (!req.file) {
      console.error('❌ No file in request');
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Nenhum ficheiro foi enviado'
      });
    }

    console.log('🖼️ Background image uploaded:', req.file.filename);
    console.log('👤 Uploaded by:', req.session.email || req.session.userId);

    // Get the old background filename from database
    const oldBgResult = await pool.query(`
      SELECT setting_value 
      FROM front_page_settings 
      WHERE setting_key = 'hero_background_filename'
    `);

    // Delete old background file if it exists
    if (oldBgResult.rows.length > 0 && oldBgResult.rows[0].setting_value) {
      const oldFilePath = path.join(__dirname, '../uploads/images', oldBgResult.rows[0].setting_value);
      await fs.unlink(oldFilePath).catch(console.error);
    }

    // Store full URL for cross-domain access
    const apiUrl = process.env.API_URL || 'https://api.ipmaia-winterjam.pt/api';
    const imageUrl = `${apiUrl}/frontpage/background`;

    // Update database with new filename and URL
    await pool.query(`
      INSERT INTO front_page_settings (setting_key, setting_value, setting_type, display_name, section, display_order)
      VALUES ('hero_background_filename', $1, 'text', 'Background Filename', 'hero', 99)
      ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
    `, [req.file.filename]);

    await pool.query(`
      INSERT INTO front_page_settings (setting_key, setting_value, setting_type, display_name, section, display_order)
      VALUES ('hero_background_image', $1, 'url', 'Background Image URL', 'hero', 98)
      ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
    `, [imageUrl]);

    res.json({
      message: 'Background image uploaded successfully',
      filename: req.file.filename,
      url: imageUrl,
      size: req.file.size
    });
  } catch (error) {
    console.error('❌ Error uploading background image:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to upload background image',
      message: 'Erro ao carregar imagem',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Handle OPTIONS preflight for background image
router.options('/background', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(204).send();
});

// Download/serve background image (public)
router.get('/background', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT setting_value 
      FROM front_page_settings 
      WHERE setting_key = 'hero_background_filename'
    `);
    
    if (!result.rows.length || !result.rows[0].setting_value) {
      return res.status(404).json({ 
        error: 'Background image not found',
        message: 'Nenhuma imagem de fundo foi carregada'
      });
    }
    
    const filename = result.rows[0].setting_value;
    const filePath = path.join(__dirname, '../uploads/images', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ 
        error: 'Background image file not found',
        message: 'Ficheiro de imagem não encontrado'
      });
    }
    
    // Determine content type from extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp'
    };
    
    // Set CORS headers to allow cross-origin image loading
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', contentTypes[ext] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Stream the file
    const fileStream = require('fs').createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error serving background image:', error);
    res.status(500).json({ 
      error: 'Failed to serve background image',
      message: 'Erro ao carregar imagem'
    });
  }
});

module.exports = router;