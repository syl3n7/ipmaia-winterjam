const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// In-memory storage for development fallback
let sponsors = [
  {
    id: 1,
    name: 'IPMAIA',
    tier: 'platinum',
    logo_url: '/images/ipmaia-logo.png',
    website_url: 'https://ipmaia.pt',
    description: 'Instituto Politécnico da Maia - Patrocinador principal do WinterJam',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let nextId = 2;

// Check if we're in development mode (database disabled)
const isDevelopment = process.env.NODE_ENV !== 'production';

// Validation helper
const validateSponsor = (data) => {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Nome é obrigatório');
  }

  if (!data.tier || !['platinum', 'gold', 'silver', 'bronze'].includes(data.tier)) {
    errors.push('Nível de patrocínio inválido');
  }

  if (data.logo_url && typeof data.logo_url !== 'string') {
    errors.push('URL do logo deve ser uma string válida');
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
    let activeSponsors = [];

    if (isDevelopment) {
      // Use in-memory storage for development
      activeSponsors = sponsors.filter(sponsor => sponsor.is_active);
    } else {
      // Get active sponsors from database
      const result = await pool.query(`
        SELECT id, name, tier, logo_url, website_url, description, is_active, created_at, updated_at
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
      activeSponsors = result.rows;
    }

    // Sort by tier (platinum first, then gold, silver, bronze)
    const tierOrder = { platinum: 1, gold: 2, silver: 3, bronze: 4 };
    activeSponsors.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);

    // Transform to frontend format
    const frontendSponsors = activeSponsors.map((sponsor, index) => ({
      imgSrc: sponsor.logo_url,
      alt: sponsor.name,
      href: sponsor.website_url,
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
    let allSponsors = [];

    if (isDevelopment) {
      // Use in-memory storage for development
      allSponsors = [...sponsors];
    } else {
      // Get all sponsors from database
      const result = await pool.query(`
        SELECT id, name, tier, logo_url, website_url, description, is_active, created_at, updated_at
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
      allSponsors = result.rows;
    }

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

// POST /api/sponsors - Create new sponsor
router.post('/', async (req, res) => {
  try {
    const { name, tier, logo_url, website_url, description, is_active } = req.body;

    // Validate input
    const validationErrors = validateSponsor(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: validationErrors
      });
    }

    let newSponsor;

    if (isDevelopment) {
      // Use in-memory storage for development
      const existingSponsor = sponsors.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (existingSponsor) {
        return res.status(409).json({
          success: false,
          error: 'Já existe um patrocinador com este nome'
        });
      }

      newSponsor = {
        id: nextId++,
        name: name.trim(),
        tier,
        logo_url: logo_url ? logo_url.trim() : null,
        website_url: website_url ? website_url.trim() : null,
        description: description ? description.trim() : null,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      sponsors.push(newSponsor);
    } else {
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
        INSERT INTO sponsors (name, tier, logo_url, website_url, description, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, tier, logo_url, website_url, description, is_active, created_at, updated_at
      `, [
        name.trim(),
        tier,
        logo_url ? logo_url.trim() : null,
        website_url ? website_url.trim() : null,
        description ? description.trim() : null,
        is_active !== undefined ? Boolean(is_active) : true
      ]);

      newSponsor = result.rows[0];
    }

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

// PUT /api/sponsors/:id - Update sponsor
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, tier, logo_url, website_url, description, is_active } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    let updatedSponsor;

    if (isDevelopment) {
      // Use in-memory storage for development
      const sponsorIndex = sponsors.findIndex(s => s.id === id);
      if (sponsorIndex === -1) {
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
      const existingSponsor = sponsors.find(s =>
        s.id !== id && s.name.toLowerCase() === name.toLowerCase()
      );
      if (existingSponsor) {
        return res.status(409).json({
          success: false,
          error: 'Já existe um patrocinador com este nome'
        });
      }

      // Update sponsor
      updatedSponsor = {
        ...sponsors[sponsorIndex],
        name: name.trim(),
        tier,
        logo_url: logo_url ? logo_url.trim() : null,
        website_url: website_url ? website_url.trim() : null,
        description: description ? description.trim() : null,
        is_active: is_active !== undefined ? Boolean(is_active) : sponsors[sponsorIndex].is_active,
        updated_at: new Date().toISOString()
      };

      sponsors[sponsorIndex] = updatedSponsor;
    } else {
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

      // Update sponsor
      const result = await pool.query(`
        UPDATE sponsors
        SET name = $1, tier = $2, logo_url = $3, website_url = $4, description = $5, is_active = $6, updated_at = NOW()
        WHERE id = $7
        RETURNING id, name, tier, logo_url, website_url, description, is_active, created_at, updated_at
      `, [
        name.trim(),
        tier,
        logo_url ? logo_url.trim() : null,
        website_url ? website_url.trim() : null,
        description ? description.trim() : null,
        is_active !== undefined ? Boolean(is_active) : existingResult.rows[0].is_active,
        id
      ]);

      updatedSponsor = result.rows[0];
    }

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

// DELETE /api/sponsors/:id - Delete sponsor
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    let deletedSponsor;

    if (isDevelopment) {
      // Use in-memory storage for development
      const sponsorIndex = sponsors.findIndex(s => s.id === id);
      if (sponsorIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Patrocinador não encontrado'
        });
      }

      deletedSponsor = sponsors.splice(sponsorIndex, 1)[0];
    } else {
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
      deletedSponsor = existingResult.rows[0];
    }

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

module.exports = router;