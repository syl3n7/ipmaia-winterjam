const express = require('express');
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

module.exports = router;