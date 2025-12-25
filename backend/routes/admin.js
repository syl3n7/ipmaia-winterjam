const express = require('express');
const { pool } = require('../config/database');
const GameJam = require('../models/GameJam');
const Game = require('../models/Game');
const { requireAdmin, requireSuperAdmin } = require('./auth');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { parseCSV, sanitizeTeamName, sanitizeMemberNames } = require('../utils/csvParser');
const router = express.Router();

// generate color palette (server-side equivalent of generateWheelColors)
function generateWheelColors(count) {
  const basePalette = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
    '#F472B6', '#FB7185', '#9CA3AF', '#FACC15', '#4ADE80', '#34D399', '#2DD4BF', '#38BDF8',
    '#60A5FA', '#818CF8', '#A78BFA', '#C084FC', '#F472B6', '#FDA4AF', '#FBCFE8', '#E0F2FE'
  ];
  if (count <= basePalette.length) return basePalette.slice(0, count);
  const colors = [...basePalette];
  const golden = 137.508;
  const needed = count - basePalette.length;
  for (let i = 0; i < needed; i++) {
    const hue = ((i * golden) % 360).toFixed(2);
    colors.push(`hsl(${hue}, 70%, 55%)`);
  }
  return colors;
}

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

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

// Theme wheel (per game jam)
router.get('/gamejams/:id/theme-wheel', async (req, res) => {
  try {
    const gameJam = await GameJam.findById(req.params.id);
    if (!gameJam) {
      return res.status(404).json({ error: 'Game jam not found' });
    }

    // custom_fields may come as object or string, normalize to object
    let customFields = gameJam.custom_fields || {};
    if (typeof customFields === 'string') {
      try {
        customFields = JSON.parse(customFields);
      } catch (parseErr) {
        console.warn('⚠️ Failed to parse custom_fields JSON, using empty object');
        customFields = {};
      }
    }

    res.json({
      id: gameJam.id,
      name: gameJam.name,
      theme: gameJam.theme,
      wheelConfig: customFields.theme_wheel || null,
      lastWinner: customFields.theme_wheel_last_winner || null,
    });
  } catch (error) {
    console.error('Error fetching theme wheel:', error);
    res.status(500).json({ error: 'Failed to fetch theme wheel data' });
  }
});

router.put('/gamejams/:id/theme-wheel', async (req, res) => {
  try {
    const { theme, wheelConfig, winner } = req.body;

    const gameJam = await GameJam.findById(req.params.id);
    if (!gameJam) {
      return res.status(404).json({ error: 'Game jam not found' });
    }

    // Normalize existing custom fields
    let customFields = gameJam.custom_fields || {};
    if (typeof customFields === 'string') {
      try {
        customFields = JSON.parse(customFields);
      } catch (parseErr) {
        console.warn('⚠️ Failed to parse custom_fields JSON, resetting to empty object');
        customFields = {};
      }
    }

    // Merge new wheel data
    if (wheelConfig !== undefined) {
      customFields.theme_wheel = wheelConfig;
    }
    if (winner !== undefined) {
      customFields.theme_wheel_last_winner = winner;
    }

    const payload = { custom_fields: customFields };
    if (theme !== undefined) {
      payload.theme = theme;
    }

    const updated = await GameJam.update(req.params.id, payload);

    res.json({
      message: 'Theme wheel updated',
      gameJam: {
        id: updated.id,
        name: updated.name,
        theme: updated.theme,
      },
      wheelConfig: customFields.theme_wheel || null,
      lastWinner: customFields.theme_wheel_last_winner || null,
    });
  } catch (error) {
    console.error('Error updating theme wheel:', error);
    res.status(500).json({ error: 'Failed to update theme wheel' });
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

// CSV Import endpoint - Import teams as games
router.post('/games/import-teams', upload.single('csv'), async (req, res) => {
  try {
    console.log('📋 CSV Import - Starting import');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file provided' });
    }

    const { gameJamId } = req.body;
    if (!gameJamId) {
      return res.status(400).json({ error: 'gameJamId is required' });
    }

    // Verify game jam exists
    const gameJam = await GameJam.findById(gameJamId);
    if (!gameJam) {
      return res.status(404).json({ error: `Game jam with ID ${gameJamId} not found` });
    }

    // Parse CSV
    const csvText = req.file.buffer.toString('utf-8');
    const { teams, errors } = parseCSV(csvText);

    console.log(`📋 CSV Import - Parsed ${teams.length} teams with ${errors.length} errors`);

    if (errors.length > 0) {
      console.warn('⚠️ CSV Import - Warnings:', errors);
    }

    if (teams.length === 0) {
      return res.status(400).json({ 
        error: 'No valid teams found in CSV',
        details: errors,
        parsed: 0
      });
    }

    // Create games from teams
    const results = {
      imported: [],
      failed: [],
      warnings: errors
    };
    const colors = generateWheelColors(teams.length);
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      try {
        // Sanitize data
        const teamName = sanitizeTeamName(team.teamName);
        const members = sanitizeMemberNames(team.members);

        // Create game record
        const gameData = {
          game_jam_id: gameJamId,
          title: `${teamName} - [Pending Game Name]`, // Placeholder until game name is filled
          description: `Team: ${teamName}\nMembers: ${members.length}\nEmail: ${team.emailContact}${team.phoneContact ? '\nPhone: ' + team.phoneContact : ''}`,
          team_name: teamName,
          team_members: members,
          github_url: null,
          itch_url: null,
          screenshot_urls: [],
          tags: [],
          is_featured: false,
          // Store team registration data in custom fields
          custom_fields: {
            institution: team.institution,
            full_attendance: team.fullAttendance,
            previous_participation: team.previousParticipation,
            equipment_request: team.equipmentRequest,
            allergies: team.allergies,
            allergies_details: team.allergiesDetails,
            specific_diet: team.specificDiet,
            photo_consent: team.photoConsent,
            regulation_accept: team.regulationAccept,
            contact_email: team.emailContact,
            contact_phone: team.phoneContact,
            how_found: team.howFound,
            team_size: team.teamSize,
            dinner_attendance: team.dinnerAttendance,
            friday_dinner: team.fridayDinner,
            registration_timestamp: team.timestamp
          },
          custom_fields_visibility: {
            institution: false,
            full_attendance: false,
            previous_participation: false,
            equipment_request: false,
            allergies: false,
            allergies_details: false,
            specific_diet: false,
            photo_consent: false,
            regulation_accept: false,
            contact_email: false,
            contact_phone: false,
            how_found: false,
            team_size: false,
            dinner_attendance: false,
            friday_dinner: false,
            registration_timestamp: false
          }
        };

        // Persist color in custom fields
        gameData.custom_fields.raffle_color = colors[i];
        const game = await Game.create(gameData);
        results.imported.push({
          id: game.id,
          teamName: teamName,
          members: members,
          gameId: game.id,
          color: colors[i]
        });

        console.log(`✅ Created game for team: ${teamName}`);
      } catch (error) {
        results.failed.push({
          teamName: team.teamName,
          error: error.message
        });
        console.error(`❌ Failed to create game for team ${team.teamName}:`, error);
      }
    }

    res.status(201).json({
      message: 'CSV import completed',
      summary: {
        total_teams_in_csv: teams.length,
        successfully_imported: results.imported.length,
        failed: results.failed.length,
        warnings: results.warnings.length
      },
      results: results,
      gameJam: {
        id: gameJam.id,
        name: gameJam.name
      }
    });

  } catch (error) {
    console.error('❌ CSV Import Error:', error);
    res.status(500).json({ 
      error: 'Failed to process CSV import',
      details: error.message 
    });
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
            console.log('✅ Updated existing Game Jam: %s (ID: %s)', jam.name, existingId);
          } else {
            // Create new
            await GameJam.create(jamData);
            console.log('✅ Created new Game Jam: %s', jam.name);
          }
          results.gamejams_imported++;
        } catch (error) {
          console.error('❌ Failed to import game jam %s:', jam.name || 'unknown', error);
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
              console.log('✅ Updated existing Game: %s (ID: %s)', game.title, existingId);
            } else {
              // Create new
              await Game.create(gameData);
              console.log('✅ Created new Game: %s', game.title);
            }
            results.games_imported++;
          } else {
            results.errors.push(`Game jam not found for game: ${game.title}`);
          }
        } catch (error) {
          console.error('❌ Failed to import game %s:', game.title || 'unknown', error);
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

// NOTE: Sponsor management has been moved to /api/sponsors routes (see routes/sponsors.js)
// This avoids duplication and provides better organization

// Super Admin System Operations
router.post('/system/clear-cache', requireSuperAdmin, async (req, res) => {
  try {
    console.log('🗑️ Super admin clearing cache...');
    
    // Clear require cache for dynamic modules (if needed)
    Object.keys(require.cache).forEach(key => {
      if (key.includes('/models/') || key.includes('/routes/')) {
        delete require.cache[key];
      }
    });
    
    // Log the action
    const { logAudit } = require('../utils/auditLog');
    await logAudit({
      userId: req.session.userId,
      username: req.session.username || req.session.email,
      action: 'SYSTEM_OPERATION',
      description: 'Cleared server cache',
      req
    });
    
    console.log('✅ Cache cleared successfully');
    res.json({ 
      success: true, 
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

router.post('/system/restart', requireSuperAdmin, async (req, res) => {
  try {
    console.log('🔄 Super admin requesting server restart...');
    
    // Send response first
    res.json({ 
      success: true, 
      message: 'Server restart initiated. Please wait 10-15 seconds.',
      timestamp: new Date().toISOString()
    });
    
    // Wait a moment to ensure response is sent
    setTimeout(() => {
      console.log('🔄 Restarting server...');
      process.exit(0); // Let process manager (pm2, docker, etc.) restart the server
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error restarting server:', error);
    res.status(500).json({ error: 'Failed to restart server' });
  }
});

// Maintenance mode toggle
const MAINTENANCE_FILE = '/var/maintenance_flag/maintenance.on';
const MAINTENANCE_DIR = '/var/maintenance_flag';

router.post('/system/maintenance', requireSuperAdmin, async (req, res) => {
  try {
    // Ensure maintenance directory exists
    if (!fs.existsSync(MAINTENANCE_DIR)) {
      fs.mkdirSync(MAINTENANCE_DIR, { recursive: true });
    }

    // Check current state
    const currentState = fs.existsSync(MAINTENANCE_FILE);
    const newState = !currentState;

    if (newState) {
      // Enable maintenance mode
      fs.writeFileSync(MAINTENANCE_FILE, new Date().toISOString());
      console.log('🚧 Maintenance mode ENABLED');
    } else {
      // Disable maintenance mode
      if (fs.existsSync(MAINTENANCE_FILE)) {
        fs.unlinkSync(MAINTENANCE_FILE);
      }
      console.log('✅ Maintenance mode DISABLED');
    }
    
    res.json({ 
      success: true, 
      enabled: newState,
      message: `Maintenance mode ${newState ? 'enabled' : 'disabled'}. Admin panel remains accessible at api.ipmaia-winterjam.pt/admin`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error toggling maintenance mode:', error);
    res.status(500).json({ 
      error: 'Failed to toggle maintenance mode',
      details: error.message 
    });
  }
});

router.get('/system/maintenance', async (req, res) => {
  try {
    const enabled = fs.existsSync(MAINTENANCE_FILE);
    res.json({ enabled });
  } catch (error) {
    console.error('❌ Error checking maintenance mode:', error);
    res.status(500).json({ error: 'Failed to check maintenance mode' });
  }
});

// Get system metrics
router.get('/system/metrics', async (req, res) => {
  try {
    // Memory usage
    const memUsage = process.memoryUsage();
    const memoryMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024), // Resident Set Size
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };

    // Process uptime
    const uptimeSeconds = process.uptime();
    const uptimeFormatted = {
      days: Math.floor(uptimeSeconds / 86400),
      hours: Math.floor((uptimeSeconds % 86400) / 3600),
      minutes: Math.floor((uptimeSeconds % 3600) / 60),
      seconds: Math.floor(uptimeSeconds % 60)
    };

    // Active sessions count
    const sessionsResult = await pool.query('SELECT COUNT(*) as count FROM user_sessions');
    const activeSessions = parseInt(sessionsResult.rows[0].count) || 0;

    // Storage info (uploads directory)
    const uploadsPath = path.join(__dirname, '../uploads');
    let storageInfo = {
      available: false,
      totalFiles: 0,
      totalSize: 0,
      sponsors: 0
    };

    try {
      if (fs.existsSync(uploadsPath)) {
        storageInfo.available = true;
        
        // Count sponsor logos
        const sponsorsPath = path.join(uploadsPath, 'sponsors');
        if (fs.existsSync(sponsorsPath)) {
          const sponsorFiles = fs.readdirSync(sponsorsPath);
          storageInfo.sponsors = sponsorFiles.length;
          
          // Calculate total size
          sponsorFiles.forEach(file => {
            const filePath = path.join(sponsorsPath, file);
            const stats = fs.statSync(filePath);
            storageInfo.totalSize += stats.size;
          });
        }
        
        storageInfo.totalFiles = storageInfo.sponsors;
      }
    } catch (storageError) {
      console.error('Error reading storage info:', storageError);
    }

    res.json({
      memory: memoryMB,
      uptime: uptimeFormatted,
      uptimeSeconds: Math.floor(uptimeSeconds),
      activeSessions,
      storage: storageInfo,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    });
  } catch (error) {
    console.error('❌ Error fetching system metrics:', error);
    res.status(500).json({ error: 'Failed to fetch system metrics' });
  }
});

// Test database connection
router.get('/system/test-db', requireSuperAdmin, async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Test connection
    const connectionTest = await pool.query('SELECT 1 as test');
    const connectionOk = connectionTest.rows[0].test === 1;
    
    // Test query
    const queryTest = await pool.query('SELECT COUNT(*) as count FROM game_jams');
    const queryOk = queryTest.rows.length > 0;
    
    const responseTime = Date.now() - startTime;
    
    res.json({
      success: true,
      connection: connectionOk,
      query: queryOk,
      responseTime: responseTime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({ 
      success: false,
      connection: false,
      query: false,
      error: error.message 
    });
  }
});

// User Management
// PocketID integration removed - users are local only
router.get('/users', requireSuperAdmin, async (req, res) => {
  try {
    // Always fetch from local database
    const result = await pool.query(
      'SELECT id, username, email, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    
    const users = result.rows.map(u => ({ 
      ...u, 
      source: 'local'
    }));
    
    console.log(`✅ Fetched ${users.length} users from local database`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/users/:id/role', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, email } = req.body;
    
    // Validate role
    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    // Prevent changing own role via session check
    if (req.session.email && req.session.email === email) {
      return res.status(403).json({ error: 'Cannot change your own role' });
    }
    
    // Role changes are local overrides stored in DB
    
    // Check if user exists in local DB
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      // Update existing local user role
      const result = await pool.query(
        'UPDATE users SET role = $1, updated_at = NOW() WHERE email = $2 RETURNING id, username, email, role',
        [role, email]
      );
      console.log('✅ Local user role updated: %s -> %s', email, role);
      res.json(result.rows[0]);
    } else {
      // Create local user entry with role override
      const result = await pool.query(
        'INSERT INTO users (username, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role',
        [email.split('@')[0], email, '', role, true]
      );
      console.log('✅ Created local user with role override: %s -> %s', email, role);
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

router.put('/users/:id/toggle', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    // Prevent deactivating own account
    if (req.session.email && req.session.email === email) {
      return res.status(403).json({ error: 'Cannot deactivate your own account' });
    }
    
    // Note: We toggle status in the local DB only; external identity providers are unaffected
    
    const result = await pool.query(
      'UPDATE users SET is_active = NOT is_active, updated_at = NOW() WHERE email = $1 RETURNING id, username, is_active',
      [email]
    );
    
    if (result.rows.length === 0) {
      // Create user entry with inactive status
      const createResult = await pool.query(
        'INSERT INTO users (username, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, is_active',
        [email.split('@')[0], email, '', 'user', false]
      );
      console.log('✅ User %s deactivated (local override created)', email);
      return res.json(createResult.rows[0]);
    }
    
    console.log('✅ User %s %s by super admin %s', email, result.rows[0].is_active ? 'activated' : 'deactivated', req.session.username);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

// Delete user from local database
router.delete('/users/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    // Prevent deleting own account
    if (req.session.email && req.session.email === email) {
      return res.status(403).json({ error: 'Cannot delete your own account' });
    }
    
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT username FROM users WHERE id = $1',
      [id]
    );
    
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete the user
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    // Log the deletion
    const { logAudit } = require('../utils/auditLog');
    await logAudit({
      userId: req.session.userId,
      username: req.session.username || req.session.email,
      action: 'DELETE_USER',
      tableName: 'users',
      recordId: id,
      description: `Deleted user: ${email} (${existingUser.rows[0].username})`,
      req
    });
    
    console.log('✅ User %s deleted by super admin %s', email, req.session.username);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// PocketID user sync endpoint removed/disabled
router.post('/users/sync-from-pocketid', requireSuperAdmin, async (req, res) => {
  res.status(404).json({ success: false, error: 'PocketID integration disabled' });
});

// Registration status - get current public registration state
router.get('/registration', requireSuperAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT setting_value FROM front_page_settings WHERE setting_key = 'public_registration_enabled'");
    let enabled;
    if (result.rows.length > 0) {
      enabled = result.rows[0].setting_value === 'true';
    } else {
      enabled = process.env.PUBLIC_REGISTRATION_ENABLED === 'true' || process.env.NODE_ENV !== 'production';
    }
    res.json({ enabled });
  } catch (error) {
    console.error('Error fetching registration status:', error);
    res.status(500).json({ error: 'Failed to fetch registration status' });
  }
});

// Update registration status (enable/disable public registration)
router.put('/registration', requireSuperAdmin, async (req, res) => {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') return res.status(400).json({ error: 'Invalid value for enabled' });

    console.log('PUT /admin/registration - updating enabled =>', enabled);
    await pool.query(
      "INSERT INTO front_page_settings (setting_key, setting_value, setting_type, display_name, section, display_order) VALUES ('public_registration_enabled', $1, 'boolean', 'Allow Public Registration', 'auth', 0) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP",
      [enabled ? 'true' : 'false']
    );
    console.log('PUT /admin/registration - DB update complete');

    // Audit log
    try {
      await logAudit({
        userId: req.session.userId,
        username: req.session.username || req.session.email,
        action: 'UPDATE',
        tableName: 'front_page_settings',
        description: `${enabled ? 'Enabled' : 'Disabled'} public registration via admin`,
        newValues: { public_registration_enabled: enabled },
        req
      });
    } catch (err) {
      console.error('❌ Failed to write audit log for registration toggle:', err);
    }

    res.json({ enabled });
  } catch (error) {
    console.error('Error updating registration status:', error);
    res.status(500).json({ error: 'Failed to update registration status' });
  }
});

// Invite a new user (admin only) - creates user if not exists and returns invite token (link)
const { sendInviteEmail, SMTP_CONFIGURED } = require('../utils/email');
const { logAudit } = require('../utils/auditLog');
const { isStrongPassword } = require('../utils/validation');
const User = require('../models/User');

// Super Admin: change user's password
router.put('/users/:id/password', requireSuperAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Missing password' });

    const pwCheck = isStrongPassword(password);
    if (!pwCheck.ok) return res.status(400).json({ error: pwCheck.reason });

    const passwordHash = await User.hashPassword(password);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, userId]);

    try {
      await logAudit({
        userId: req.session.userId,
        username: req.session.username,
        action: 'UPDATE',
        tableName: 'users',
        recordId: userId,
        description: 'Super admin changed user password',
        newValues: { password_reset: true },
        req
      });
    } catch (err) {
      console.error('❌ Failed to write audit log for password reset:', err);
    }

    res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    console.error('Error updating user password:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

router.post('/users/invite', requireSuperAdmin, async (req, res) => {
  try {
    const { username, email, expiresOption, sendEmail } = req.body;
    if (!email || !username) return res.status(400).json({ error: 'Missing username or email' });

    // Rate limit: one invite per minute per admin
    const lastInvite = await pool.query(
      "SELECT created_at FROM invites WHERE created_by = $1 ORDER BY created_at DESC LIMIT 1",
      [req.session.userId]
    );
    if (lastInvite.rows[0]) {
      const diffMs = Date.now() - new Date(lastInvite.rows[0].created_at).getTime();
      if (diffMs < 60 * 1000) {
        return res.status(429).json({ error: 'Rate limit: Please wait before creating another invite (1 per minute)' });
      }
    }

    // Check if user exists
    let result = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    let user = result.rows[0];

    if (!user) {
      // Create user with no password (user will set password via invite link)
      const insert = await pool.query(
        'INSERT INTO users (username, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [username, email, '', 'user', true]
      );
      user = insert.rows[0];
    }

    // Compute expiresAt based on option (defaults to 7 days)
    let expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
    if (expiresOption === '1h') expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);
    else if (expiresOption === '3d') expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    else if (expiresOption === '7d') expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Generate token and store hash
    const token = require('crypto').randomBytes(32).toString('hex');
    const bcrypt = require('bcryptjs');
    const tokenHash = await bcrypt.hash(token, 10);

    const insertInvite = await pool.query(
      'INSERT INTO invites (user_id, token_hash, expires_at, used, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [user.id, tokenHash, expiresAt, false, req.session.userId]
    );

    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${token}`;

    let emailSent = false;
    if (sendEmail && SMTP_CONFIGURED) {
      emailSent = await sendInviteEmail(email, inviteLink, expiresAt);
    }

    // Write audit log for invite creation (non-blocking)
    try {
      await logAudit({
        userId: req.session.userId,
        username: req.session.username,
        action: 'CREATE_INVITE',
        tableName: 'invites',
        recordId: insertInvite.rows[0].id,
        description: `Invite created for user ${user.id} (${user.email})`,
        newValues: { user_id: user.id, expires_at: expiresAt.toISOString(), sendEmail: !!sendEmail },
        req
      });
    } catch (err) {
      console.error('❌ Failed to write audit log for invite creation:', err);
    }

    // NOTE: In production, you should email the invite link to the user automatically (sendEmail=true)
    res.json({ success: true, inviteLink, expiresAt, user: { id: user.id, username: user.username, email: user.email }, emailSent });
  } catch (error) {
    console.error('Error creating invite:', error);
    res.status(500).json({ error: 'Failed to create invite' });
  }
});

// PocketID status endpoint removed
router.get('/pocketid/status', requireSuperAdmin, async (req, res) => {
  res.status(404).json({ configured: false, connected: false, message: 'PocketID integration disabled' });
});

// Audit Logs
const { getAuditLogs, getAuditStats } = require('../utils/auditLog');

router.get('/audit-logs', requireSuperAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const filters = {
      userId: req.query.userId,
      action: req.query.action,
      tableName: req.query.tableName
    };
    
    const logs = await getAuditLogs(limit, offset, filters);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

router.get('/audit-logs/stats', requireSuperAdmin, async (req, res) => {
  try {
    const stats = await getAuditStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({ error: 'Failed to fetch audit stats' });
  }
});

module.exports = router;