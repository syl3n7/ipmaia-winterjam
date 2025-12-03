const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const rateLimit = require('express-rate-limit');
const { pool } = require('../config/database');
const { requireAdmin } = require('./auth');
const router = express.Router();

// Rate limiter for logo uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 uploads per hour
  message: 'Too many upload attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.connection.remoteAddress || '0.0.0.0';
    return ip.split(':')[0];
  }
});

// Configure multer for sponsor logo uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/sponsors');
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
    const filename = `sponsor_${timestamp}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and SVG images are allowed'));
    }
  }
});

// In-memory storage disabled - always use database
// let sponsors = [];
// let nextId = 1;

// Check if we're in development mode (database disabled)
const isDevelopment = false; // Always use database for sponsors

// Validation helper
const validateSponsor = (data) => {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Nome é obrigatório');
  }

  if (!data.tier || !['platinum', 'gold', 'silver', 'bronze'].includes(data.tier)) {
    errors.push('Nível de patrocínio inválido');
  }

  if (data.logo_filename && typeof data.logo_filename !== 'string') {
    errors.push('Nome do ficheiro do logo deve ser uma string válida');
  }

  if (data.website_url && typeof data.website_url !== 'string') {
    errors.push('URL do website deve ser uma string válida');
  }

  if (data.description && typeof data.description !== 'string') {
    errors.push('Descrição deve ser uma string');
  }

  return errors;
};

// GET /api/sponsors - Get all sponsors
router.get('/', async (req, res) => {
  try {
    // Get active sponsors from database
    const result = await pool.query(`
      SELECT id, name, tier, logo_filename, website_url, description, is_active, created_at, updated_at
      FROM sponsors
      WHERE is_active = true
      ORDER BY
        CASE tier
          WHEN 'platinum' THEN 1
          WHEN 'gold' THEN 2
          WHEN 'silver' THEN 3
          WHEN 'bronze' THEN 4
        END,
        name
    `);
    const activeSponsors = result.rows;

    // Sort by tier (platinum first, then gold, silver, bronze)
    const tierOrder = { platinum: 1, gold: 2, silver: 3, bronze: 4 };
    activeSponsors.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);

    // Transform to frontend format
    const frontendSponsors = activeSponsors.map((sponsor, index) => ({
      imgSrc: sponsor.logo_filename ? `${req.protocol}://${req.get('host')}/api/sponsors/logo/${sponsor.logo_filename}` : null,
      alt: sponsor.name,
      href: sponsor.website_url ? (sponsor.website_url.startsWith('http') ? sponsor.website_url : (sponsor.website_url.startsWith('/') ? `${req.protocol}://${req.get('host')}${sponsor.website_url}` : `https://${sponsor.website_url}`)) : null,
      index: index
    }));

    res.json({
      success: true,
      sponsors: frontendSponsors
    });
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/sponsors/admin - Get all sponsors for admin (including inactive)
router.get('/admin', async (req, res) => {
  try {
    // Get all sponsors from database
    const result = await pool.query(`
      SELECT id, name, tier, logo_filename, website_url, description, is_active, created_at, updated_at
      FROM sponsors
      ORDER BY
        CASE tier
          WHEN 'platinum' THEN 1
          WHEN 'gold' THEN 2
          WHEN 'silver' THEN 3
          WHEN 'bronze' THEN 4
        END,
        name
    `);
    const allSponsors = result.rows;

    // Sort by tier and then by name
    const tierOrder = { platinum: 1, gold: 2, silver: 3, bronze: 4 };
    allSponsors.sort((a, b) => {
      if (tierOrder[a.tier] !== tierOrder[b.tier]) {
        return tierOrder[a.tier] - tierOrder[b.tier];
      }
      return a.name.localeCompare(b.name);
    });

    res.json({
      success: true,
      sponsors: allSponsors
    });
  } catch (error) {
    console.error('Error fetching sponsors for admin:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/sponsors - Create new sponsor (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, tier, logo_filename, website_url, description, is_active } = req.body;

    // Validate input
    const validationErrors = validateSponsor(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: validationErrors
      });
    }

    // Check for duplicate names
    const existingResult = await pool.query(
      'SELECT id FROM sponsors WHERE LOWER(name) = LOWER($1)',
      [name.trim()]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Já existe um patrocinador com este nome'
      });
    }

    // Create new sponsor
    const result = await pool.query(`
      INSERT INTO sponsors (name, tier, logo_filename, website_url, description, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, tier, logo_filename, website_url, description, is_active, created_at, updated_at
    `, [
      name.trim(),
      tier,
      logo_filename ? logo_filename.trim() : null,
      website_url ? website_url.trim() : null,
      description ? description.trim() : null,
      is_active !== undefined ? Boolean(is_active) : true
    ]);

    const newSponsor = result.rows[0];

    res.status(201).json({
      success: true,
      sponsor: newSponsor,
      message: 'Patrocinador criado com sucesso'
    });
  } catch (error) {
    console.error('Error creating sponsor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// PUT /api/sponsors/:id - Update sponsor (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, tier, logo_filename, website_url, description, is_active } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    // Check if sponsor exists
    const existingResult = await pool.query(
      'SELECT id FROM sponsors WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Patrocinador não encontrado'
      });
    }

    // Validate input
    const validationErrors = validateSponsor(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: validationErrors
      });
    }

    // Check for duplicate names (excluding current sponsor)
    const duplicateResult = await pool.query(
      'SELECT id FROM sponsors WHERE LOWER(name) = LOWER($1) AND id != $2',
      [name.trim(), id]
    );

    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Já existe um patrocinador com este nome'
      });
    }

    // Build dynamic update query - only update fields that are provided
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }

    if (tier !== undefined) {
      updates.push(`tier = $${paramIndex++}`);
      values.push(tier);
    }

    if (logo_filename !== undefined) {
      updates.push(`logo_filename = $${paramIndex++}`);
      values.push(logo_filename ? logo_filename.trim() : null);
    }

    if (website_url !== undefined) {
      updates.push(`website_url = $${paramIndex++}`);
      values.push(website_url ? website_url.trim() : null);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description ? description.trim() : null);
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(is_active !== undefined ? Boolean(is_active) : existingResult.rows[0].is_active);
    }

    // Always update updated_at
    updates.push(`updated_at = NOW()`);

    // Add id at the end
    values.push(id);

    if (updates.length === 1) { // Only updated_at
      return res.status(400).json({
        success: false,
        error: 'Nenhum campo para atualizar'
      });
    }

    const query = `
      UPDATE sponsors
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, tier, logo_filename, website_url, description, is_active, created_at, updated_at
    `;

    const result = await pool.query(query, values);

    const updatedSponsor = result.rows[0];

    res.json({
      success: true,
      sponsor: updatedSponsor,
      message: 'Patrocinador atualizado com sucesso'
    });
  } catch (error) {
    console.error('Error updating sponsor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/sponsors/:id - Delete sponsor (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    // Check if sponsor exists
    const existingResult = await pool.query(
      'SELECT id, name FROM sponsors WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Patrocinador não encontrado'
      });
    }

    // Delete sponsor
    await pool.query('DELETE FROM sponsors WHERE id = $1', [id]);
    const deletedSponsor = existingResult.rows[0];

    res.json({
      success: true,
      sponsor: deletedSponsor,
      message: 'Patrocinador removido com sucesso'
    });
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Upload sponsor logo without ID (returns filename for later use) (admin only)
router.post('/upload-logo', requireAdmin, uploadLimiter, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum ficheiro foi enviado'
      });
    }

    console.log('🖼️ Sponsor logo uploaded (temp):', req.file.filename);

    res.json({
      success: true,
      filename: req.file.filename,
      message: 'Logo carregado com sucesso'
    });
  } catch (error) {
    console.error('❌ Error uploading logo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao carregar logo'
    });
  }
});

// Upload sponsor logo for existing sponsor (admin only)
router.post('/upload-logo/:id', requireAdmin, uploadLimiter, upload.single('logo'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum ficheiro foi enviado'
      });
    }

    console.log('🖼️ Sponsor logo uploaded:', req.file.filename);
    console.log('👤 Uploaded by:', req.session?.email || req.session?.userId || 'unknown');

    // Check if sponsor exists
    const existingResult = await pool.query(
      'SELECT id, logo_filename FROM sponsors WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Patrocinador não encontrado'
      });
    }

    // Delete old logo file if it exists
    if (existingResult.rows[0].logo_filename) {
      const oldFilePath = path.join(__dirname, '../uploads/sponsors', existingResult.rows[0].logo_filename);
      await fs.unlink(oldFilePath).catch(console.error);
    }

    // Update sponsor with new logo filename
    const result = await pool.query(`
      UPDATE sponsors
      SET logo_filename = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, tier, logo_filename, website_url, description, is_active, created_at, updated_at
    `, [req.file.filename, id]);

    const updatedSponsor = result.rows[0];

    res.json({
      success: true,
      sponsor: updatedSponsor,
      message: 'Logo do patrocinador carregado com sucesso',
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error uploading sponsor logo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao carregar logo',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Serve sponsor logo images (public)
router.get('/logo/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/sponsors', filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        error: 'Logo not found',
        message: 'Imagem não encontrada'
      });
    }

    // Determine content type from extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml'
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
    console.error('Error serving sponsor logo:', error);
    res.status(500).json({
      error: 'Failed to serve logo',
      message: 'Erro ao carregar imagem'
    });
  }
});

module.exports = router;