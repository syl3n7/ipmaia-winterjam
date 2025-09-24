const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Games routes - TODO: implement CRUD operations' });
});

module.exports = router;