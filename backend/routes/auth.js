const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { Issuer, Strategy } = require('openid-client');
const passport = require('passport');

const router = express.Router();

// Initialize OIDC client
let oidcClient = null;

const initOIDC = async () => {
  if (!process.env.OIDC_ISSUER_URL) {
    console.log('⚠️ OIDC not configured - OIDC_ISSUER_URL missing');
    return;
  }

  try {
    const issuer = await Issuer.discover(process.env.OIDC_ISSUER_URL);
    
    oidcClient = new issuer.Client({
      client_id: process.env.OIDC_CLIENT_ID,
      client_secret: process.env.OIDC_CLIENT_SECRET,
      redirect_uris: [process.env.OIDC_REDIRECT_URI || 'http://localhost:3001/api/auth/oidc/callback'],
      response_types: ['code'],
    });

    // Configure Passport OIDC strategy
    passport.use('oidc', new Strategy({ client: oidcClient }, async (tokenSet, userinfo, done) => {
      try {
        // Check if user exists or create them
        let result = await pool.query(
          'SELECT * FROM users WHERE email = $1',
          [userinfo.email]
        );

        let user = result.rows[0];
        
        if (!user) {
          // Create new user
          result = await pool.query(
            'INSERT INTO users (username, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userinfo.preferred_username || userinfo.email, userinfo.email, '', 'admin', true]
          );
          user = result.rows[0];
          console.log('✅ Created new OIDC user:', user.email);
        }

        return done(null, user);
      } catch (error) {
        console.error('❌ OIDC user processing error:', error);
        return done(error);
      }
    }));

    console.log('✅ OIDC client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize OIDC:', error);
  }
};

// Initialize OIDC on startup
initOIDC();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND is_active = true',
      [username]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({
    id: req.session.userId,
    username: req.session.username,
    role: req.session.role
  });
});

// OIDC Routes
router.get('/oidc/login', (req, res, next) => {
  if (!oidcClient) {
    return res.status(500).json({ error: 'OIDC not configured' });
  }
  
  const authorizationUrl = oidcClient.authorizationUrl({
    scope: 'openid email profile',
    state: 'admin-login'
  });
  
  res.redirect(authorizationUrl);
});

router.get('/oidc/callback', async (req, res) => {
  if (!oidcClient) {
    return res.status(500).json({ error: 'OIDC not configured' });
  }

  try {
    const params = oidcClient.callbackParams(req);
    const tokenSet = await oidcClient.callback(process.env.OIDC_REDIRECT_URI, params);
    const userinfo = await oidcClient.userinfo(tokenSet);

    // Check if user exists or create them
    let result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [userinfo.email]
    );

    let user = result.rows[0];
    
    if (!user) {
      // Create new user
      result = await pool.query(
        'INSERT INTO users (username, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userinfo.preferred_username || userinfo.email, userinfo.email, '', 'admin', true]
      );
      user = result.rows[0];
      console.log('✅ Created new OIDC user:', user.email);
    }

    // Create session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    req.session.email = user.email;

    // Redirect to admin dashboard
    res.redirect('/admin');
  } catch (error) {
    console.error('❌ OIDC callback error:', error);
    res.status(500).json({ error: 'OIDC authentication failed' });
  }
});

module.exports = router;