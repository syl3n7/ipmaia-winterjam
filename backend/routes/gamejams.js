// Placeholder route files - we'll expand these later
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'GameJam routes - TODO: implement CRUD operations' });
});

module.exports = router;