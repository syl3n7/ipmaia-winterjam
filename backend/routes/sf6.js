const express = require('express');
const { getStats } = require('../services/sf6Scraper');

const router = express.Router();

// GET /api/sf6/stats
// Returns the latest cached SF6 stats for the configured CFN username.
// Returns 503 if the scraper hasn't completed its first successful poll yet.
router.get('/stats', (req, res) => {
  const stats = getStats();

  if (!stats) {
    return res.status(503).json({
      error: 'Stats not available yet — scraper is still initialising. Try again in a few seconds.',
    });
  }

  res.json(stats);
});

module.exports = router;
