const express = require('express');
const GameJam = require('../models/GameJam');
const Game = require('../models/Game');

const router = express.Router();

// Get all active game jams
router.get('/gamejams', async (req, res) => {
  try {
    console.log('🔍 Fetching all game jams...');
    const gameJams = await GameJam.findAll(true); // Include all (active and inactive) for dropdown
    console.log(`📊 Found ${gameJams.length} total game jams`);
    res.json(gameJams);
  } catch (error) {
    console.error('❌ Error fetching game jams:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ error: 'Failed to fetch game jams' });
  }
});

// Get only inactive game jams (for archive)
router.get('/gamejams/inactive', async (req, res) => {
  try {
    console.log('🔍 Fetching inactive game jams...');
    const allGameJams = await GameJam.findAll(true); // Get all
    const inactiveGameJams = allGameJams.filter(jam => !jam.is_active);
    console.log(`📊 Found ${inactiveGameJams.length} inactive game jams`);
    res.json(inactiveGameJams);
  } catch (error) {
    console.error('❌ Error fetching inactive game jams:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ error: 'Failed to fetch inactive game jams' });
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

// Get current active game jam
router.get('/current', async (req, res) => {
  try {
    console.log('🔍 Fetching current game jam...');
    
    // First try to get all active game jams
    const activeGameJams = await GameJam.findAll(false); // Only active
    console.log('📊 Active game jams found:', activeGameJams.length);
    
    if (activeGameJams.length > 0) {
      // Find the most recent active game jam
      const currentGameJam = activeGameJams
        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];
      
      console.log('🎯 Current game jam selected:', currentGameJam.name);
      return res.json(currentGameJam);
    }
    
    // If no active game jams, try to get the most recent one regardless of active status
    console.log('⚠️ No active game jams found, trying all game jams...');
    const allGameJams = await GameJam.findAll(true); // Include inactive
    console.log('📊 Total game jams found:', allGameJams.length);
    
    if (allGameJams.length > 0) {
      const mostRecentGameJam = allGameJams
        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];
      
      console.log('🎯 Most recent game jam selected:', mostRecentGameJam.name);
      return res.json(mostRecentGameJam);
    }
    
    console.log('❌ No game jams found at all');
    return res.status(404).json({ 
      error: 'No game jams found',
      details: 'Please create at least one game jam in the admin interface'
    });
    
  } catch (error) {
    console.error('❌ Error fetching current game jam:', error);
    res.status(500).json({ error: 'Failed to fetch current game jam' });
  }
});

// Get active game jam (legacy endpoint)
router.get('/gamejams/active/current', async (req, res) => {
  try {
    const activeGameJam = await GameJam.getActive();
    res.json(activeGameJam || null);
  } catch (error) {
    console.error('Error fetching active game jam:', error);
    res.status(500).json({ error: 'Failed to fetch active game jam' });
  }
});

// Get all games
router.get('/games', async (req, res) => {
  try {
    const games = await Game.findAll();
    res.json(games);
  } catch (error) {
    console.error('Error fetching all games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
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

// Get game jam by year and season
router.get('/archive/:year/:season', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const season = req.params.season;
    
    if (isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year' });
    }
    
    console.log(`🔍 Looking for game jam: ${year} ${season}`);
    
    const gameJams = await GameJam.findByYearAndSeason(year, season);
    console.log(`📊 Found ${gameJams.length} game jams for ${year} ${season}`);
    
    if (gameJams.length === 0) {
      // If no specific match, try to find any game jam with that year
      console.log(`⚠️ No game jams found for ${year} ${season}, trying year only...`);
      const yearGameJams = await GameJam.findByYear(year);
      console.log(`📊 Found ${yearGameJams.length} game jams for year ${year}`);
      
      if (yearGameJams.length === 0) {
        return res.status(404).json({ 
          error: 'No game jam found for this year and season',
          year: year,
          season: season,
          suggestion: 'Check available game jams in admin interface'
        });
      }
      
      // Return the most recent game jam for this year
      const gameJam = yearGameJams.sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];
      console.log(`🎯 Selected game jam from year fallback: ${gameJam.name}`);
      return res.json(gameJam);
    }
    
    // Return the most recent game jam for this year/season
    const gameJam = gameJams.sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];
    console.log(`🎯 Selected game jam: ${gameJam.name}`);
    
    res.json(gameJam);
  } catch (error) {
    console.error('❌ Error fetching archive:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch archive',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;