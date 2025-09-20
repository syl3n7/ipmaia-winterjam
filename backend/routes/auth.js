const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { Issuer, Strategy } = require('openid-client');
const passport = require('passport');

const router = express.Router();

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  
  next();
};

// Export middleware for use in other routes
router.requireAdmin = requireAdmin;

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
          // Determine user role based on OIDC_ADMIN_EMAIL
          const isAdmin = userinfo.email === process.env.OIDC_ADMIN_EMAIL;
          const role = isAdmin ? 'admin' : 'user';
          
          // Create new user
          result = await pool.query(
            'INSERT INTO users (username, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userinfo.preferred_username || userinfo.email, userinfo.email, '', role, true]
          );
          user = result.rows[0];
          console.log(`✅ Created new OIDC user: ${user.email} with role: ${role}`);
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

// Legacy login - DISABLED (OIDC only)
router.post('/login', async (req, res) => {
  return res.status(403).json({
    error: 'Legacy login disabled. Please use OIDC authentication.',
    redirect: '/api/auth/oidc/login'
  });
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
      // Determine user role based on OIDC_ADMIN_EMAIL
      const isAdmin = userinfo.email === process.env.OIDC_ADMIN_EMAIL;
      const role = isAdmin ? 'admin' : 'user';
      
      // Create new user
      result = await pool.query(
        'INSERT INTO users (username, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userinfo.preferred_username || userinfo.email, userinfo.email, '', role, true]
      );
      user = result.rows[0];
      console.log(`✅ Created new OIDC user: ${user.email} with role: ${role}`);
    }

    // Check if user has admin privileges
    if (user.role !== 'admin') {
      return res.status(403).send(`
        <html>
          <head><title>Access Denied</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 100px;">
            <h1>🚫 Access Denied</h1>
            <p>You don't have admin privileges for this application.</p>
            <p>Contact the administrator if you need access.</p>
            <p><strong>Your email:</strong> ${user.email}</p>
            <p><strong>Admin email:</strong> ${process.env.OIDC_ADMIN_EMAIL}</p>
          </body>
        </html>
      `);
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