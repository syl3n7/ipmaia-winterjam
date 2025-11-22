const express = require('express');
const { pool } = require('../config/database');
const GameJam = require('../models/GameJam');
const Game = require('../models/Game');
const { requireAdmin, requireSuperAdmin } = require('./auth');
const router = express.Router();

// All admin routes require admin privileges
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', (req, res) => {
  res.json({ 
    message: 'Admin dashboard data',
    user: {
      id: req.session.userId || 1,
      username: req.session.username || 'admin',
      role: req.session.role || 'admin'
    }
  });
});

// Game Jams CRUD
router.get('/gamejams', async (req, res) => {
  try {
    const gameJams = await GameJam.findAll(true); // Include inactive
    res.json(gameJams);
  } catch (error) {
    console.error('Error fetching game jams:', error);
    res.status(500).json({ error: 'Failed to fetch game jams' });
  }
});

router.post('/gamejams', async (req, res) => {
  try {
    const gameJam = await GameJam.create(req.body);
    res.status(201).json(gameJam);
  } catch (error) {
    console.error('Error creating game jam:', error);
    res.status(500).json({ error: 'Failed to create game jam' });
  }
});

router.get('/gamejams/:id', async (req, res) => {
  try {
    const gameJam = await GameJam.findById(req.params.id);
    if (!gameJam) {
      return res.status(404).json({ error: 'Game jam not found' });
    }
    res.json(gameJam);
  } catch (error) {
    console.error('Error fetching game jam:', error);
    res.status(500).json({ error: 'Failed to fetch game jam' });
  }
});

router.put('/gamejams/:id', async (req, res) => {
  try {
    const gameJam = await GameJam.update(req.params.id, req.body);
    if (!gameJam) {
      return res.status(404).json({ error: 'Game jam not found' });
    }
    res.json(gameJam);
  } catch (error) {
    console.error('Error updating game jam:', error);
    res.status(500).json({ error: 'Failed to update game jam' });
  }
});

router.delete('/gamejams/:id', requireSuperAdmin, async (req, res) => {
  try {
    const success = await GameJam.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Game jam not found' });
    }
    res.json({ message: 'Game jam deleted successfully' });
  } catch (error) {
    console.error('Error deleting game jam:', error);
    res.status(500).json({ error: 'Failed to delete game jam' });
  }
});

// Games CRUD
router.get('/games', async (req, res) => {
  try {
    const games = await Game.findAll();
    res.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

router.post('/games', async (req, res) => {
  try {
    const game = await Game.create(req.body);
    res.status(201).json(game);
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

router.get('/games/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

router.put('/games/:id', async (req, res) => {
  try {
    console.log('🎮 UPDATE GAME - ID:', req.params.id);
    console.log('🎮 UPDATE GAME - Request body:', JSON.stringify(req.body, null, 2));
    
    const game = await Game.update(req.params.id, req.body);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    console.error('❌ Error updating game:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Request ID:', req.params.id);
    console.error('❌ Request body:', JSON.stringify(req.body, null, 2));
    res.status(500).json({ error: 'Failed to update game' });
  }
});

router.delete('/games/:id', requireSuperAdmin, async (req, res) => {
  try {
    const success = await Game.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ error: 'Failed to delete game' });
  }
});

// Export endpoints
router.get('/export/all', async (req, res) => {
  try {
    const format = req.query.format || 'json';
    const gameJams = await GameJam.findAll(true); // Include inactive
    const games = await Game.findAll();
    
    const exportData = {
      exported_at: new Date().toISOString(),
      total_game_jams: gameJams.length,
      total_games: games.length,
      game_jams: gameJams,
      games: games
    };

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="winterjam-export-${Date.now()}.json"`);
      res.json(exportData);
    } else {
      res.status(400).json({ error: 'Unsupported format. Use ?format=json' });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

router.get('/export/gamejam/:id', async (req, res) => {
  try {
    const format = req.query.format || 'json';
    const gameJam = await GameJam.findById(req.params.id);
    
    if (!gameJam) {
      return res.status(404).json({ error: 'Game jam not found' });
    }
    
    const games = await Game.findByGameJamId(req.params.id);
    
    const exportData = {
      exported_at: new Date().toISOString(),
      game_jam: gameJam,
      games: games,
      total_games: games.length
    };

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="gamejam-${gameJam.id}-export-${Date.now()}.json"`);
      res.json(exportData);
    } else {
      res.status(400).json({ error: 'Unsupported format. Use ?format=json' });
    }
  } catch (error) {
    console.error('Error exporting game jam:', error);
    res.status(500).json({ error: 'Failed to export game jam' });
  }
});

// Import endpoint - restore exported data
router.post('/import', async (req, res) => {
  try {
    // Support both formats: game_jams (from export) and gamejams
    const gamejams = req.body.gamejams || req.body.game_jams;
    const games = req.body.games;
    const frontpage_settings = req.body.frontpage_settings;
    const rules_content = req.body.rules_content;
    
    const results = {
      gamejams_imported: 0,
      games_imported: 0,
      frontpage_settings_imported: 0,
      rules_content_imported: 0,
      errors: []
    };

    // Import Game Jams
    if (gamejams && Array.isArray(gamejams)) {
      const { pool } = require('../config/database');
      
      for (const jam of gamejams) {
        try {
          // Remove system fields
          const jamData = { ...jam };
          delete jamData.created_at;
          delete jamData.updated_at;
          delete jamData.id; // Remove ID to let it match by name or create new
          
          // Check if already exists by name (more reliable than ID)
          const existingResult = await pool.query(
            'SELECT id FROM game_jams WHERE name = $1',
            [jam.name]
          );
          
          if (existingResult.rows.length > 0) {
            // Update existing by name
            const existingId = existingResult.rows[0].id;
            await GameJam.update(existingId, jamData);
            console.log(`✅ Updated existing Game Jam: ${jam.name} (ID: ${existingId})`);
          } else {
            // Create new
            await GameJam.create(jamData);
            console.log(`✅ Created new Game Jam: ${jam.name}`);
          }
          results.gamejams_imported++;
        } catch (error) {
          console.error(`❌ Failed to import game jam ${jam.name || 'unknown'}:`, error);
          results.errors.push(`Failed to import game jam ${jam.name || 'unknown'}: ${error.message}`);
        }
      }
    }

    // Import Games
    if (games && Array.isArray(games)) {
      const { pool } = require('../config/database');
      
      for (const game of games) {
        try {
          // Remove system fields
          const gameData = { ...game };
          delete gameData.created_at;
          delete gameData.updated_at;
          delete gameData.id; // Remove ID to let it match by title+jam or create new
          
          // Check if already exists by title and game_jam_id
          // First, find the actual game_jam_id by name since IDs might differ
          const jamResult = await pool.query(
            'SELECT id FROM game_jams WHERE name = $1',
            [game.game_jam_name || 'WinterJam 2025']
          );
          
          if (jamResult.rows.length > 0) {
            const actualJamId = jamResult.rows[0].id;
            gameData.game_jam_id = actualJamId;
            
            // Check if game already exists by title and jam
            const existingResult = await pool.query(
              'SELECT id FROM games WHERE title = $1 AND game_jam_id = $2',
              [game.title, actualJamId]
            );
            
            if (existingResult.rows.length > 0) {
              // Update existing by title+jam
              const existingId = existingResult.rows[0].id;
              await Game.update(existingId, gameData);
              console.log(`✅ Updated existing Game: ${game.title} (ID: ${existingId})`);
            } else {
              // Create new
              await Game.create(gameData);
              console.log(`✅ Created new Game: ${game.title}`);
            }
            results.games_imported++;
          } else {
            results.errors.push(`Game jam not found for game: ${game.title}`);
          }
        } catch (error) {
          console.error(`❌ Failed to import game ${game.title || 'unknown'}:`, error);
          results.errors.push(`Failed to import game ${game.title || 'unknown'}: ${error.message}`);
        }
      }
    }

    // Import Front Page Settings
    if (frontpage_settings && Array.isArray(frontpage_settings)) {
      const { pool } = require('../config/database');
      for (const setting of frontpage_settings) {
        try {
          await pool.query(
            `INSERT INTO frontpage_settings (setting_key, setting_value, setting_type, display_name, section_name, description, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (setting_key) DO UPDATE 
             SET setting_value = EXCLUDED.setting_value,
                 setting_type = EXCLUDED.setting_type,
                 display_name = EXCLUDED.display_name,
                 section_name = EXCLUDED.section_name,
                 description = EXCLUDED.description,
                 display_order = EXCLUDED.display_order`,
            [setting.setting_key, setting.setting_value, setting.setting_type, 
             setting.display_name, setting.section_name, setting.description, setting.display_order]
          );
          results.frontpage_settings_imported++;
        } catch (error) {
          results.errors.push(`Failed to import frontpage setting ${setting.setting_key}: ${error.message}`);
        }
      }
    }

    // Import Rules Content
    if (rules_content && Array.isArray(rules_content)) {
      const { pool } = require('../config/database');
      for (const rule of rules_content) {
        try {
          await pool.query(
            `INSERT INTO rules_content (section_key, section_title, content, display_order, is_active)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (section_key) DO UPDATE 
             SET section_title = EXCLUDED.section_title,
                 content = EXCLUDED.content,
                 display_order = EXCLUDED.display_order,
                 is_active = EXCLUDED.is_active`,
            [rule.section_key, rule.section_title, rule.content, rule.display_order, 
             rule.is_active !== false]
          );
          results.rules_content_imported++;
        } catch (error) {
          results.errors.push(`Failed to import rule ${rule.section_key}: ${error.message}`);
        }
      }
    }

    res.json({
      success: true,
      message: 'Import completed',
      ...results
    });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Failed to import data', details: error.message });
  }
});

// Sponsor Management
router.get('/sponsors', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sponsors ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});

router.post('/sponsors', async (req, res) => {
  try {
    const { name, tier, logo_filename, website_url, description } = req.body;

    if (!name || !tier) {
      return res.status(400).json({ error: 'Nome e nível são obrigatórios' });
    }

    const result = await pool.query(
      `INSERT INTO sponsors (name, tier, logo_filename, website_url, description, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [name, tier, logo_filename, website_url, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating sponsor:', error);
    res.status(500).json({ error: 'Failed to create sponsor' });
  }
});

router.put('/sponsors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, tier, logo_filename, website_url, description, is_active } = req.body;

    // Check if sponsor exists
    const existingResult = await pool.query(
      'SELECT id, name, tier, logo_filename, website_url, description, is_active FROM sponsors WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Patrocinador não encontrado' });
    }

    const existing = existingResult.rows[0];

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
      values.push(Boolean(is_active));
    }

    // Always update updated_at
    updates.push(`updated_at = NOW()`);

    // Add id at the end
    values.push(id);

    if (updates.length === 1) { // Only updated_at
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    const query = `
      UPDATE sponsors
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating sponsor:', error);
    res.status(500).json({ error: 'Failed to update sponsor' });
  }
});

router.delete('/sponsors/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM sponsors WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patrocinador não encontrado' });
    }

    res.json({ message: 'Patrocinador removido com sucesso' });
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    res.status(500).json({ error: 'Failed to delete sponsor' });
  }
});

module.exports = router;