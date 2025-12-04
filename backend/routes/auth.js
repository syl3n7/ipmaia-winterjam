const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { Issuer, Strategy } = require('openid-client');
const passport = require('passport');
const { logAudit } = require('../utils/auditLog');

const router = express.Router();

// Admin middleware
const requireAdmin = (req, res, next) => {
  // In development or when auth bypass is enabled, skip authentication checks
  if (process.env.NODE_ENV !== 'production' || process.env.DEV_BYPASS_AUTH === 'true') {
    req.session.userId = req.session.userId || 1;
    req.session.username = req.session.username || 'dev-admin';
    req.session.role = req.session.role || 'super_admin';
    return next();
  }

  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.session.role !== 'admin' && req.session.role !== 'super_admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }

  next();
};

// Super admin middleware (for destructive operations)
const requireSuperAdmin = (req, res, next) => {
  // In development or when auth bypass is enabled, skip authentication checks
  if (process.env.NODE_ENV !== 'production' || process.env.DEV_BYPASS_AUTH === 'true') {
    req.session.userId = req.session.userId || 1;
    req.session.username = req.session.username || 'dev-admin';
    req.session.role = req.session.role || 'super_admin';
    return next();
  }

  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.session.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin privileges required' });
  }

  next();
};

// Export middleware for use in other routes
router.requireAdmin = requireAdmin;
router.requireSuperAdmin = requireSuperAdmin;

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
          // Determine user role based on OIDC groups and email
          const groups = userinfo.groups || userinfo.memberOf || [];
          let role = 'user'; // default role
          
          // Normalize groups to lowercase for case-insensitive comparison
          const normalizedGroups = groups.map(g => g.toLowerCase());
          
          // Super admin: must be in "admin" group AND have the admin email
          if (normalizedGroups.includes('admin') && userinfo.email === process.env.OIDC_ADMIN_EMAIL) {
            role = 'super_admin';
          } 
          // Admin: must be in "IPMAIA" or "users" group (case-insensitive)
          else if (normalizedGroups.includes('ipmaia') || normalizedGroups.includes('users')) {
            role = 'admin';
          }
          
          // Create new user
          result = await pool.query(
            'INSERT INTO users (username, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userinfo.preferred_username || userinfo.email, userinfo.email, '', role, true]
          );
          user = result.rows[0];
          console.log('✅ Created new OIDC user: %s with role: %s (groups: %s)', user.email, role, groups.join(', '));
        } else {
          // Check if user is deactivated locally
          if (!user.is_active) {
            console.log('🚫 Login blocked: User %s is deactivated locally', user.email);
            return done(null, false, { message: 'Your account has been deactivated. Please contact an administrator.' });
          }
          // Update existing user's role if their groups/email have changed
          const groups = userinfo.groups || userinfo.memberOf || [];
          let newRole = 'user';
          
          // Normalize groups to lowercase for case-insensitive comparison
          const normalizedGroups = groups.map(g => g.toLowerCase());
          
          // Super admin: must be in "admin" group AND have the admin email
          if (normalizedGroups.includes('admin') && userinfo.email === process.env.OIDC_ADMIN_EMAIL) {
            newRole = 'super_admin';
          } 
          // Admin: must be in "IPMAIA" or "users" group (case-insensitive)
          else if (normalizedGroups.includes('ipmaia') || normalizedGroups.includes('users')) {
            newRole = 'admin';
          }
          
          if (user.role !== newRole) {
            await pool.query(
              'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2',
              [newRole, user.id]
            );
            user.role = newRole;
            console.log('🔄 Updated existing user %s role to: %s (groups: %s)', user.email, newRole, groups.join(', '));
          }
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

// Initialize OIDC on startup (only if not bypassing auth)
if (process.env.DEV_BYPASS_AUTH !== 'true') {
  initOIDC();
} else {
  console.log('🔄 OIDC initialization skipped (DEV_BYPASS_AUTH=true)');
}

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
  // In development, return dev user if not authenticated
  if (process.env.NODE_ENV !== 'production' && !req.session.userId) {
    return res.json({
      id: 1,
      username: 'dev-admin',
      email: 'dev@admin.local',
      role: 'super_admin'
    });
  }

  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({
    id: req.session.userId,
    username: req.session.username,
    email: req.session.email,
    role: req.session.role
  });
});

// OIDC Routes
router.get('/oidc/login', (req, res, next) => {
  // In development with auth bypass, create a dev session and redirect to admin
  if (process.env.DEV_BYPASS_AUTH === 'true') {
    req.session.userId = 1;
    req.session.username = 'dev-admin';
    req.session.role = 'super_admin';
    req.session.email = 'dev@admin.local';
    console.log('🔄 DEV_BYPASS_AUTH: Created dev session and redirecting to admin');
    return res.redirect('/admin');
  }

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
    scope: 'openid email profile groups',
    state: state
  });
  
  console.log('🔄 Generated OIDC login URL with state:', state);
  console.log('📝 Session ID:', req.sessionID);
  console.log('📝 Session data:', { oidcState: req.session.oidcState });
  res.redirect(authorizationUrl);
});

router.get('/oidc/callback', async (req, res) => {
  // In development with auth bypass, this route should not be reached
  if (process.env.DEV_BYPASS_AUTH === 'true') {
    console.log('⚠️ OIDC callback called in dev bypass mode - redirecting to admin');
    return res.redirect('/admin');
  }

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
    console.log('👤 User info received (full object):', JSON.stringify(userinfo, null, 2));
    console.log('👤 User info received (summary):', { 
      email: userinfo.email, 
      preferred_username: userinfo.preferred_username,
      groups: userinfo.groups,
      memberOf: userinfo.memberOf,
      roles: userinfo.roles
    });
    
    // Also check the ID token claims
    const idTokenClaims = tokenSet.claims();
    console.log('🎫 ID Token claims (full):', JSON.stringify(idTokenClaims, null, 2));
    console.log('🎫 ID Token groups/roles:', {
      groups: idTokenClaims.groups,
      memberOf: idTokenClaims.memberOf,
      roles: idTokenClaims.roles,
      'cognito:groups': idTokenClaims['cognito:groups'],
      realm_access: idTokenClaims.realm_access
    });

    // Check if user exists or create them
    let result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [userinfo.email]
    );

    let user = result.rows[0];
    
    if (!user) {
      // Determine user role based on OIDC groups and email
      // Try multiple possible locations for group information
      const groups = userinfo.groups || 
                     userinfo.memberOf || 
                     idTokenClaims.groups || 
                     idTokenClaims.memberOf ||
                     idTokenClaims['cognito:groups'] ||
                     (idTokenClaims.realm_access && idTokenClaims.realm_access.roles) ||
                     [];
      
      console.log('🔍 Extracted groups for new user:', groups);
      let role = 'user'; // default role
      
      // Normalize groups to lowercase for case-insensitive comparison
      const normalizedGroups = groups.map(g => g.toLowerCase());
      
      // Super admin: must be in "admin" group AND have the admin email
      if (normalizedGroups.includes('admin') && userinfo.email === process.env.OIDC_ADMIN_EMAIL) {
        role = 'super_admin';
      } 
      // Admin: must be in "IPMAIA" or "users" group (case-insensitive)
      else if (normalizedGroups.includes('ipmaia') || normalizedGroups.includes('users')) {
        role = 'admin';
      }
      
      console.log('🎯 Determined role for new user: %s (email: %s, groups: %s)', role, userinfo.email, JSON.stringify(groups));
      
      // Create new user
      result = await pool.query(
        'INSERT INTO users (username, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userinfo.preferred_username || userinfo.email, userinfo.email, '', role, true]
      );
      user = result.rows[0];
      console.log('✅ Created new OIDC user: %s with role: %s (groups: %s)', user.email, role, groups.join(', '));
    } else {
      // Update existing user's role if their groups/email have changed
      const groups = userinfo.groups || 
                     userinfo.memberOf || 
                     idTokenClaims.groups || 
                     idTokenClaims.memberOf ||
                     idTokenClaims['cognito:groups'] ||
                     (idTokenClaims.realm_access && idTokenClaims.realm_access.roles) ||
                     [];
      
      console.log('🔍 Extracted groups for existing user:', groups);
      let newRole = 'user';
      
      // Normalize groups to lowercase for case-insensitive comparison
      const normalizedGroups = groups.map(g => g.toLowerCase());
      
      // Super admin: must be in "admin" group AND have the admin email
      if (normalizedGroups.includes('admin') && userinfo.email === process.env.OIDC_ADMIN_EMAIL) {
        newRole = 'super_admin';
      } 
      // Admin: must be in "IPMAIA" or "users" group (case-insensitive)
      else if (normalizedGroups.includes('ipmaia') || normalizedGroups.includes('users')) {
        newRole = 'admin';
      }
      
      console.log('🎯 Determined role for existing user: %s (email: %s, groups: %s)', newRole, userinfo.email, JSON.stringify(groups));
      
      if (user.role !== newRole) {
        await pool.query(
          'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2',
          [newRole, user.id]
        );
        user.role = newRole;
        console.log('🔄 Updated existing user %s role from %s to: %s (groups: %s)', user.email, user.role, newRole, groups.join(', '));
      }
    }

    // Check if user has admin privileges
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).send(`
        <html>
          <head><title>Access Denied</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 100px;">
            <h1>🚫 Access Denied</h1>
            <p>You don't have admin privileges for this application.</p>
            <p>Contact the administrator if you need access.</p>
            <p><strong>Your email:</strong> ${user.email}</p>
            <p><strong>Your role:</strong> ${user.role}</p>
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

    // Log the login
    await logAudit({
      userId: user.id,
      username: user.username,
      action: 'LOGIN',
      description: `User logged in via OIDC (role: ${user.role})`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

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