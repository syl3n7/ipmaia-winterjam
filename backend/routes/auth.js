const express = require('express');
const User = require('../models/User');
const { generateToken, verifyToken } = require('../utils/auth');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const passport = require('passport');
const { logAudit } = require('../utils/auditLog');

const router = express.Router();

// --- Isolated authentication system (no PocketID, no OIDC) ---
// In-memory user store for demo (replace with DB in production)
const isolatedUsers = [];

// Registration endpoint
router.post('/isolated/register', async (req, res) => {
  // Determine public registration flag from DB (override env) or fallback to env/dev default
  let publicRegistrationEnabled;
  try {
    const settingRes = await pool.query("SELECT setting_value FROM front_page_settings WHERE setting_key = 'public_registration_enabled'");
    if (settingRes.rows.length > 0) {
      publicRegistrationEnabled = settingRes.rows[0].setting_value === 'true';
    } else {
      publicRegistrationEnabled = process.env.PUBLIC_REGISTRATION_ENABLED === 'true' || process.env.NODE_ENV !== 'production';
    }
  } catch (err) {
    console.warn('⚠️ Failed to read public registration setting from DB, falling back to environment settings:', err.message);
    publicRegistrationEnabled = process.env.PUBLIC_REGISTRATION_ENABLED === 'true' || process.env.NODE_ENV !== 'production';
  }

  if (!publicRegistrationEnabled) {
    return res.status(403).json({ error: 'Public registration is disabled. Admins can invite users.' });
  }

  let { username, email, password } = req.body;
  // Use default dev credentials if not provided in dev env
  if (process.env.NODE_ENV !== 'production') {
    username = username || 'dev-admin';
    email = email || 'dev-mail@steelchunk.eu';
    password = password || 'dev-pw';
  }
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // Check if user exists in DB
  const dbCheck = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
  if (dbCheck.rows.length > 0) {
    return res.status(409).json({ error: 'User already exists' });
  }
  const passwordHash = await User.hashPassword(password);
  // Make the first registered user a super_admin (only the very first)
  const dbCount = await pool.query('SELECT COUNT(*) FROM users');
  const role = dbCount.rows[0].count === '0' ? 'super_admin' : 'user';
  const dbRes = await pool.query(
    'INSERT INTO users (username, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [username, email, passwordHash, role, true]
  );
  const user = dbRes.rows[0];
  const token = generateToken(user);

  // If this is the first user, disable public registration automatically
  if (role === 'super_admin') {
    try {
      await pool.query(`
        INSERT INTO front_page_settings (setting_key, setting_value, setting_type, display_name, section, display_order)
        VALUES ('public_registration_enabled', 'false', 'boolean', 'Allow Public Registration', 'auth', 0)
        ON CONFLICT (setting_key) DO UPDATE SET setting_value = 'false', updated_at = CURRENT_TIMESTAMP
      `);

      // Audit log: registration disabled after creating the first super admin
      try {
        await logAudit({
          userId: user.id,
          username: user.username,
          action: 'UPDATE',
          tableName: 'front_page_settings',
          recordId: null,
          description: 'Auto-disabled public registration after creating first super admin',
          newValues: { public_registration_enabled: false },
          req
        });
      } catch (err) {
        console.error('❌ Failed to write audit log for registration setting change:', err);
      }
    } catch (err) {
      console.error('❌ Failed to disable public registration automatically:', err);
    }
  }

  // Audit log: user registration
  try {
    await logAudit({
      userId: user.id,
      username: user.username,
      action: 'CREATE_USER',
      tableName: 'users',
      recordId: user.id,
      description: 'User registered via isolated registration',
      newValues: { id: user.id, username: user.username, email: user.email, role: user.role },
      req
    });
  } catch (err) {
    console.error('❌ Failed to write audit log for registration:', err);
  }

  res.status(201).json({ message: 'User registered', user: { id: user.id, username: user.username, email: user.email, role: user.role }, token });
});

// Login endpoint
router.post('/isolated/login', async (req, res) => {
  let { username, password } = req.body;
  // Use default dev credentials if not provided in dev env
  if (process.env.NODE_ENV !== 'production') {
    username = username || 'dev-admin';
    password = password || 'dev-pw';
  }
  // Find user in DB
  const dbRes = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = dbRes.rows[0];
  if (!user || !user.is_active) {
    try {
      await logAudit({
        userId: user ? user.id : null,
        username: username,
        action: 'LOGIN_FAILED',
        description: 'Invalid credentials - user not found or inactive',
        req
      });
    } catch (err) {
      console.error('❌ Failed to write audit log for failed login (not found):', err);
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    try {
      await logAudit({
        userId: user.id,
        username: user.username,
        action: 'LOGIN_FAILED',
        description: 'Invalid credentials - wrong password',
        req
      });
    } catch (err) {
      console.error('❌ Failed to write audit log for failed login (wrong pw):', err);
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = generateToken(user);
  // Optionally set session cookie for compatibility
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.role = user.role;
  req.session.email = user.email;

  // Audit log: successful login
  try {
    await logAudit({
      userId: user.id,
      username: user.username,
      action: 'LOGIN',
      tableName: 'users',
      recordId: user.id,
      description: 'User logged in via isolated login',
      req
    });
  } catch (err) {
    console.error('❌ Failed to write audit log for login:', err);
  }

  res.json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email, role: user.role }, token });
});

// Invite acceptance endpoints
router.get('/invite/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const invites = await pool.query('SELECT id, user_id, token_hash, expires_at, used FROM invites WHERE expires_at > NOW()');
    const bcrypt = require('bcryptjs');

    for (const inv of invites.rows) {
      const match = await bcrypt.compare(token, inv.token_hash);
      if (match && !inv.used && new Date(inv.expires_at) > new Date()) {
        return res.json({ valid: true, userId: inv.user_id });
      }
    }
    return res.status(404).json({ valid: false, error: 'Invalid or expired token' });
  } catch (error) {
    console.error('Error checking invite token:', error);
    res.status(500).json({ error: 'Failed to validate token' });
  }
});

router.post('/invite/:token/accept', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Missing password' });

    const invites = await pool.query('SELECT id, user_id, token_hash, expires_at, used FROM invites WHERE expires_at > NOW()');
    const bcrypt = require('bcryptjs');
    let matchedInvite = null;

    for (const inv of invites.rows) {
      const match = await bcrypt.compare(token, inv.token_hash);
      if (match) {
        matchedInvite = inv;
        break;
      }
    }

    if (!matchedInvite || matchedInvite.used || new Date(matchedInvite.expires_at) <= new Date()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Set user's password
    const passwordHash = await User.hashPassword(password);
    await pool.query('UPDATE users SET password_hash = $1, is_active = TRUE, updated_at = NOW() WHERE id = $2', [passwordHash, matchedInvite.user_id]);

    // Mark invite used
    await pool.query('UPDATE invites SET used = TRUE WHERE id = $1', [matchedInvite.id]);

    // Audit log: invite accepted / account activated
    try {
      await logAudit({
        userId: matchedInvite.user_id,
        username: req.body.username || null,
        action: 'ACCEPT_INVITE',
        tableName: 'invites',
        recordId: matchedInvite.id,
        description: 'Invite accepted and password set',
        oldValues: { used: false },
        newValues: { used: true },
        req
      });

      await logAudit({
        userId: matchedInvite.user_id,
        username: null,
        action: 'ACCOUNT_ACTIVATED',
        tableName: 'users',
        recordId: matchedInvite.user_id,
        description: 'User activated via invite',
        newValues: { is_active: true },
        req
      });
    } catch (err) {
      console.error('❌ Failed to write audit log for invite acceptance:', err);
    }

    res.json({ success: true, message: 'Password set. You can now login.' });
  } catch (error) {
    console.error('Error accepting invite:', error);
    res.status(500).json({ error: 'Failed to accept invite' });
  }
});

// Admin middleware
const requireAdmin = (req, res, next) => {
  // In development or when auth bypass is enabled, skip authentication checks
  // TEMP: Disable login bypass for testing isolated auth
  // BYPASS DISABLED FOR TESTING

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
  // BYPASS DISABLED FOR TESTING

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

// OIDC and PocketID integrations removed — using isolated auth only

// Legacy login endpoint now points to isolated auth/login (use frontend /login)
router.post('/login', async (req, res) => {
  return res.status(403).json({
    error: 'Legacy login disabled. Use the isolated authentication endpoints or the frontend /login page.'
  });
});

// Logout (existing session-based logout)
router.post('/logout', async (req, res) => {
  // Audit log: logout
  try {
    if (req.session && req.session.userId) {
      await logAudit({
        userId: req.session.userId,
        username: req.session.username,
        action: 'LOGOUT',
        description: 'User logged out',
        req
      });
    }
  } catch (err) {
    console.error('❌ Failed to write audit log for logout:', err);
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
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
    email: req.session.email,
    role: req.session.role
  });
});

// CSRF token endpoint - returns current token and sets a readable cookie for client-side use
router.get('/csrf-token', (req, res) => {
  try {
    const token = req.csrfToken ? req.csrfToken() : null;
    if (!token) {
      return res.status(500).json({ error: 'CSRF token not available' });
    }

    // Set a non-HttpOnly cookie so the frontend can read it if needed
    const cookieOpts = { httpOnly: false, sameSite: 'lax' };
    if (process.env.NODE_ENV === 'production') cookieOpts.secure = true;
    res.cookie('XSRF-TOKEN', token, cookieOpts);

    res.json({ csrfToken: token });
  } catch (err) {
    console.error('Failed to get CSRF token:', err);
    res.status(500).json({ error: 'Failed to get CSRF token' });
  }
});


module.exports = router;