const express = require('express');
const GameJam = require('../models/GameJam');
const Game = require('../models/Game');

const router = express.Router();

// Get all active game jams
router.get('/gamejams', async (req, res) => {
  try {
    const gameJams = await GameJam.findAll(false); // Only active
    res.json(gameJams);
  } catch (error) {
    console.error('Error fetching game jams:', error);
    res.status(500).json({ error: 'Failed to fetch game jams' });
  }
});

// Get game jam by ID
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

// Get games by game jam ID
router.get('/gamejams/:id/games', async (req, res) => {
  try {
    const games = await Game.findByGameJam(req.params.id);
    res.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Get active game jam
router.get('/gamejams/active/current', async (req, res) => {
  try {
    const activeGameJam = await GameJam.getActive();
    res.json(activeGameJam || null);
  } catch (error) {
    console.error('Error fetching active game jam:', error);
    res.status(500).json({ error: 'Failed to fetch active game jam' });
  }
});

// Get featured games
router.get('/games/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const games = await Game.findFeatured(limit);
    res.json(games);
  } catch (error) {
    console.error('Error fetching featured games:', error);
    res.status(500).json({ error: 'Failed to fetch featured games' });
  }
});

// Search games
router.get('/games/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const games = await Game.search(q);
    res.json(games);
  } catch (error) {
    console.error('Error searching games:', error);
    res.status(500).json({ error: 'Failed to search games' });
  }
});

// Get game by ID
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

// Get games by year
router.get('/archive/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    if (isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year' });
    }
    
    const gameJams = await GameJam.findByYear(year);
    res.json(gameJams);
  } catch (error) {
    console.error('Error fetching archive:', error);
    res.status(500).json({ error: 'Failed to fetch archive' });
  }
});

// Get games by year and season
router.get('/archive/:year/:season', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const season = req.params.season;
    
    if (isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year' });
    }
    
    const gameJams = await GameJam.findByYearAndSeason(year, season);
    res.json(gameJams);
  } catch (error) {
    console.error('Error fetching archive:', error);
    res.status(500).json({ error: 'Failed to fetch archive' });
  }
});

module.exports = router;