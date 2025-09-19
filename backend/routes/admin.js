const express = require('express');
const router = express.Router();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

router.use(requireAuth);

router.get('/dashboard', (req, res) => {
  res.json({ 
    message: 'Admin dashboard data',
    user: {
      id: req.session.userId,
      username: req.session.username,
      role: req.session.role
    }
  });
});

module.exports = router;