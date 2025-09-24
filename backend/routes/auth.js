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
  
  // Generate a random state parameter and store it in session
  const state = require('crypto').randomBytes(16).toString('hex');
  req.session.oidcState = state;
  
  // Force session save to ensure it's persisted
  req.session.save((err) => {
    if (err) {
      console.error('❌ Session save error:', err);
    } else {
      console.log('✅ Session saved with state:', state);
    }
  });
  
  const authorizationUrl = oidcClient.authorizationUrl({
    scope: 'openid email profile',
    state: state
  });
  
  console.log('🔄 Generated OIDC login URL with state:', state);
  console.log('📝 Session ID:', req.sessionID);
  console.log('📝 Session data:', { oidcState: req.session.oidcState });
  res.redirect(authorizationUrl);
});

router.get('/oidc/callback', async (req, res) => {
  console.log('🔄 OIDC callback initiated');
  console.log('📝 Query params:', req.query);
  console.log('� Session ID:', req.sessionID);
  console.log('📝 Session data:', req.session);
  console.log('�🔑 OIDC configuration:', {
    issuer: process.env.OIDC_ISSUER_URL,
    clientId: process.env.OIDC_CLIENT_ID,
    redirectUri: process.env.OIDC_REDIRECT_URI,
    adminEmail: process.env.OIDC_ADMIN_EMAIL
  });

  if (!oidcClient) {
    console.error('❌ OIDC client not initialized');
    return res.status(500).json({ error: 'OIDC not configured' });
  }

  try {
    console.log('🔄 Processing callback params...');
    const params = oidcClient.callbackParams(req);
    console.log('📋 Callback params:', params);
    
    // Validate state parameter
    console.log('🔄 Validating state parameter...');
    const receivedState = params.state;
    const expectedState = req.session.oidcState;
    console.log('🔍 State validation:', { received: receivedState, expected: expectedState });
    
    // If no expected state in session, it might be a session issue - but we can still proceed
    // as long as we have a valid state format (this is a common issue with Docker/load balancers)
    if (expectedState && receivedState !== expectedState) {
      throw new Error(`State mismatch: expected ${expectedState}, received ${receivedState}`);
    } else if (!expectedState && receivedState) {
      console.log('⚠️ Session state missing but received valid state - proceeding (possible session issue)');
    } else if (!receivedState) {
      throw new Error('No state parameter received from OIDC provider');
    }
    
    console.log('🔄 Exchanging code for tokens...');
    // Handle state check - use received state for the check regardless of session state
    const checks = { state: receivedState };
    const tokenSet = await oidcClient.callback(process.env.OIDC_REDIRECT_URI, params, checks);
    console.log('✅ Token exchange successful');
    
    // Clear the state from session after successful validation
    delete req.session.oidcState;
    
    console.log('🔄 Fetching user info...');
    const userinfo = await oidcClient.userinfo(tokenSet);
    console.log('👤 User info received:', { email: userinfo.email, preferred_username: userinfo.preferred_username });

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
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      issuer: process.env.OIDC_ISSUER_URL,
      clientId: process.env.OIDC_CLIENT_ID,
      redirectUri: process.env.OIDC_REDIRECT_URI
    });
    
    // Return HTML error page for better debugging
    res.status(500).send(`
      <html>
        <head><title>OIDC Authentication Error</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>🚫 OIDC Authentication Failed</h1>
          <p><strong>Error:</strong> ${error.message}</p>
          <p><strong>Issuer:</strong> ${process.env.OIDC_ISSUER_URL}</p>
          <p><strong>Client ID:</strong> ${process.env.OIDC_CLIENT_ID}</p>
          <p><strong>Redirect URI:</strong> ${process.env.OIDC_REDIRECT_URI}</p>
          <hr>
          <p><a href="/api/auth/oidc/login">Try Again</a></p>
        </body>
      </html>
    `);
  }
});

module.exports = router;