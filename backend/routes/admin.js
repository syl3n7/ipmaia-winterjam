const express = require('express');
const { pool } = require('../config/database');
const GameJam = require('../models/GameJam');
const Game = require('../models/Game');
const { requireAdmin, requireSuperAdmin } = require('./auth');
const fs = require('fs');
const path = require('path');
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
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
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
const pocketid = require('../utils/pocketid');

router.get('/users', requireSuperAdmin, async (req, res) => {
  try {
    const usePocketID = process.env.POCKETID_API_URL && process.env.POCKETID_API_KEY;
    console.log('🔍 PocketID Configuration Check:');
    console.log('   - POCKETID_API_URL:', process.env.POCKETID_API_URL ? '✅ Set' : '❌ Missing');
    console.log('   - POCKETID_API_KEY:', process.env.POCKETID_API_KEY ? '✅ Set' : '❌ Missing');
    
    // Always fetch from local database now
    // Users should be synced from PocketID first using the sync endpoint
    const result = await pool.query(
      'SELECT id, username, email, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    
    const users = result.rows.map(u => ({ 
      ...u, 
      source: usePocketID ? 'synced_from_pocketid' : 'local' 
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
    
    // When using PocketID, we store role override in local DB
    // The actual groups in PocketID remain unchanged (read-only)
    
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
    
    // Note: We can only toggle status in local DB, not in PocketID
    // PocketID users remain active in PocketID, but we block them locally
    
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
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    console.log('✅ User %s deleted by super admin %s', email, req.session.username);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Sync users from PocketID to local database
router.post('/users/sync-from-pocketid', requireSuperAdmin, async (req, res) => {
  try {
    const usePocketID = process.env.POCKETID_API_URL && process.env.POCKETID_API_KEY;
    
    if (!usePocketID) {
      return res.status(400).json({
        success: false,
        error: 'PocketID API not configured'
      });
    }

    console.log('🔄 Starting PocketID user sync...');
    const pocketidUsers = await pocketid.getAdminUsers();
    
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const pocketUser of pocketidUsers) {
      const groupNames = pocketUser.groupNames || [];
      
      // Determine role from PocketID groups
      let role = 'admin'; // Default to admin since we only sync admin/ipmaia users
      if (groupNames.includes('admin') && pocketUser.email === process.env.OIDC_ADMIN_EMAIL) {
        role = 'super_admin';
      }

      // Prepare username from PocketID data
      const username = pocketUser.username || 
                      pocketUser.displayName || 
                      pocketUser.email?.split('@')[0] || 
                      'user';

      // Check if user exists
      const existing = await pool.query(
        'SELECT id, role, is_active FROM users WHERE email = $1',
        [pocketUser.email]
      );

      if (existing.rows.length > 0) {
        // User exists - only update if they don't have a local role override
        const localUser = existing.rows[0];
        // Skip update to preserve local overrides
        skipped++;
        console.log('   ⏭️  Skipped %s (preserving local settings)', pocketUser.email);
      } else {
        // Create new user
        // Check if user is disabled in PocketID
        const isActive = !pocketUser.disabled;
        
        await pool.query(`
          INSERT INTO users (username, email, password_hash, role, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        `, [
          username,
          pocketUser.email,
          '', // No password for OIDC users
          role,
          isActive
        ]);
        created++;
        console.log('   ✅ Created %s with role: %s (active: %s)', pocketUser.email, role, isActive);
      }
    }

    console.log(`🎉 Sync complete: ${created} created, ${updated} updated, ${skipped} skipped`);

    res.json({
      success: true,
      created,
      updated,
      skipped,
      total: pocketidUsers.length,
      message: `Synced ${created} new users from PocketID`
    });
  } catch (error) {
    console.error('❌ Error syncing users from PocketID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync users from PocketID',
      details: error.message
    });
  }
});

// PocketID connection status
router.get('/pocketid/status', requireSuperAdmin, async (req, res) => {
  try {
    const configured = !!(process.env.POCKETID_API_URL && process.env.POCKETID_API_KEY);
    
    console.log('🔍 PocketID Status Check:');
    console.log('   - Configured:', configured);
    console.log('   - API URL:', process.env.POCKETID_API_URL);
    console.log('   - API Key:', process.env.POCKETID_API_KEY ? '***set***' : 'missing');
    
    if (!configured) {
      return res.json({
        configured: false,
        connected: false,
        message: 'PocketID API not configured. Set POCKETID_API_URL and POCKETID_API_KEY'
      });
    }
    
    console.log('🔄 Testing PocketID connection...');
    const connected = await pocketid.healthCheck();
    console.log('   - Connected:', connected);
    
    res.json({
      configured: true,
      connected: connected,
      apiUrl: process.env.POCKETID_API_URL,
      message: connected ? 'Connected to PocketID' : 'Failed to connect to PocketID'
    });
  } catch (error) {
    console.error('❌ Error checking PocketID status:', error);
    res.json({
      configured: true,
      connected: false,
      error: error.message
    });
  }
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