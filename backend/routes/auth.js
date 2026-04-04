const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const { generateToken, verifyToken } = require('../utils/auth');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { logAudit } = require('../utils/auditLog');
const { sendVerificationEmail, SMTP_CONFIGURED } = require('../utils/email');

const rateLimit = require('express-rate-limit');

const router = express.Router();

const EMAIL_VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const RESEND_VERIFICATION_MESSAGE = 'If your account exists and is unverified, a new email has been sent.';

// Tight rate limit for public registration to reduce bot/spam risk
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 50, // 10 per 15min in prod
  message: 'Too many registration attempts, please try again later.'
});

// --- Isolated authentication system (no PocketID, no OIDC) ---
// In-memory user store for demo (replace with DB in production)
const isolatedUsers = [];

// Registration endpoint
router.post('/isolated/register', registrationLimiter, async (req, res) => {
  try {
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

    // Allow bootstrap registration for the very first user even when public registration is disabled.
    const userCountResult = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = Number(userCountResult.rows[0]?.count || 0);
    const isBootstrapRegistration = userCount === 0;

    if (!publicRegistrationEnabled && !isBootstrapRegistration) {
      return res.status(403).json({ error: 'Public registration is disabled. Admins can invite users.' });
    }

    let { username, email, password } = req.body;
    // Use default dev credentials if not provided in dev env
    const allowDevAuto = process.env.ALLOW_DEV_AUTOLOGIN === 'true' && process.env.NODE_ENV !== 'production';
    if (allowDevAuto) {
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

    // Validate password strength
    const { isStrongPassword } = require('../utils/validation');
    const pwCheck = isStrongPassword(password);
    if (!pwCheck.ok) return res.status(400).json({ error: pwCheck.reason });

    // Acquire advisory lock to avoid race when creating the very first user
    const LOCK_KEY = 123456789; // arbitrary constant for app-level registration lock
    let user = null;
    let role = 'user';
    try {
      await pool.query('SELECT pg_advisory_lock($1)', [LOCK_KEY]);

      const passwordHash = await User.hashPassword(password);

      // Make the first registered user a super_admin (only the very first)
      const dbCount = await pool.query('SELECT COUNT(*) FROM users');
      role = dbCount.rows[0].count === '0' ? 'super_admin' : 'user';

      let dbRes;
      try {
        dbRes = await pool.query(
          'INSERT INTO users (username, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [username, email, passwordHash, role, true]
        );
      } catch (err) {
        // Handle unique constraint (race or dupes)
        if (err.code === '23505') {
          return res.status(409).json({ error: 'User with that username or email already exists' });
        }
        throw err;
      }

      user = dbRes.rows[0];
    } finally {
      // Release advisory lock if held
      try { await pool.query('SELECT pg_advisory_unlock($1)', [LOCK_KEY]); } catch (unlockErr) { /* ignore */ }
    }

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

  // Handle email verification
  // Auto-verify: first user (super_admin), dev auto-login mode, or no SMTP configured
  const autoVerify = role === 'super_admin' || allowDevAuto || !SMTP_CONFIGURED;
  let verificationPending = false;

  if (autoVerify) {
    await pool.query('UPDATE users SET email_verified = true WHERE id = $1', [user.id]);
  } else {
    // Send verification email
    try {
      const verifyToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = await bcrypt.hash(verifyToken, 10);
      const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS);

      await pool.query(
        'INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [user.id, tokenHash, expiresAt]
      );

      const verifyLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verifyToken}`;
      await sendVerificationEmail(user.email, verifyLink);
      verificationPending = true;
    } catch (err) {
      console.error('❌ Failed to send verification email:', err);
      // Non-fatal: user can request resend later
    }
  }

    const responseToken = generateToken(user);
    res.status(201).json({
      message: verificationPending
        ? 'User registered. Please check your email to verify your account before logging in.'
        : 'User registered',
      user: { id: user.id, username: user.username, email: user.email, role: user.role, email_verified: autoVerify },
      token: responseToken,
      verificationPending
    });
  } catch (err) {
    console.error('❌ Isolated registration failed:', err);
    return res.status(500).json({
      error: process.env.NODE_ENV === 'production' ? 'Registration failed. Please try again later.' : err.message
    });
  }
});

// Login endpoint
router.post('/isolated/login', async (req, res) => {
  let { username, password } = req.body;
  // Dev auto-login gated behind ALLOW_DEV_AUTOLOGIN
  const allowDevAuto = process.env.ALLOW_DEV_AUTOLOGIN === 'true' && process.env.NODE_ENV !== 'production';
  if (allowDevAuto) {
    username = username || 'dev-admin';
    password = password || 'dev-pw';
  }

  // Find user in DB
  const dbRes = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const row = dbRes.rows[0];
  if (!row || !row.is_active) {
    try {
      await logAudit({
        userId: row ? row.id : null,
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

  const userObj = new User({ id: row.id, username: row.username, email: row.email, passwordHash: row.password_hash });
  const { ok, needsRehash } = await userObj.verifyPassword(password);
  if (!ok) {
    try {
      await logAudit({
        userId: row.id,
        username: row.username,
        action: 'LOGIN_FAILED',
        description: 'Invalid credentials - wrong password',
        req
      });
    } catch (err) {
      console.error('❌ Failed to write audit log for failed login (wrong pw):', err);
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // If we verified against bcrypt, rehash with Argon2 and update DB for migration
  if (needsRehash && row.password_hash && row.password_hash.startsWith('$2')) {
    try {
      const newHash = await User.hashPassword(password);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, row.id]);
    } catch (err) {
      console.error('❌ Failed to migrate bcrypt hash to argon2:', err);
    }
  }

  const token = generateToken(row);

  // Check email verification — only enforce when SMTP is configured
  if (SMTP_CONFIGURED && !row.email_verified) {
    try {
      await logAudit({
        userId: row.id,
        username: row.username,
        action: 'LOGIN_FAILED',
        description: 'Login blocked — email not verified',
        req
      });
    } catch (err) {
      console.error('❌ Failed to write audit log for unverified login:', err);
    }
    return res.status(401).json({
      error: 'Please verify your email address before logging in. Check your inbox for the verification link.',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }

  // Set session
  req.session.userId = row.id;
  req.session.username = row.username;
  req.session.role = row.role;
  req.session.email = row.email;
  req.session.emailVerified = row.email_verified;

  // Audit log: successful login
  try {
    await logAudit({
      userId: row.id,
      username: row.username,
      action: 'LOGIN',
      tableName: 'users',
      recordId: row.id,
      description: 'User logged in',
      req
    });
  } catch (err) {
    console.error('❌ Failed to write audit log for login:', err);
  }

  res.json({ message: 'Login successful', user: { id: row.id, username: row.username, email: row.email, role: row.role, email_verified: row.email_verified }, token });
});

// Public endpoint to check if public registration is enabled
router.get('/registration-status', async (req, res) => {
  try {
    const settingRes = await pool.query("SELECT setting_value FROM front_page_settings WHERE setting_key = 'public_registration_enabled'");
    let enabled;
    if (settingRes.rows.length > 0) {
      enabled = settingRes.rows[0].setting_value === 'true';
    } else {
      enabled = process.env.PUBLIC_REGISTRATION_ENABLED === 'true' || process.env.NODE_ENV !== 'production';
    }
    res.json({ enabled });
  } catch (err) {
    console.warn('⚠️ Failed to read public registration setting from DB, falling back to environment settings:', err.message);
    const enabled = process.env.PUBLIC_REGISTRATION_ENABLED === 'true' || process.env.NODE_ENV !== 'production';
    res.json({ enabled });
  }
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

    // Validate password strength
    const { isStrongPassword } = require('../utils/validation');
    const pwCheck = isStrongPassword(password);
    if (!pwCheck.ok) return res.status(400).json({ error: pwCheck.reason });

    // Set user's password and mark email as verified (invite link proves email ownership)
    const passwordHash = await User.hashPassword(password);
    await pool.query(
      'UPDATE users SET password_hash = $1, is_active = TRUE, email_verified = TRUE, updated_at = NOW() WHERE id = $2',
      [passwordHash, matchedInvite.user_id]
    );

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

// --- Email verification endpoints ---

// Verify email address via token link
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const rows = await pool.query(
      'SELECT id, user_id, token_hash, expires_at, used FROM email_verification_tokens WHERE expires_at > NOW() AND used = false'
    );

    let matched = null;
    for (const row of rows.rows) {
      if (await bcrypt.compare(token, row.token_hash)) {
        matched = row;
        break;
      }
    }

    if (!matched) {
      return res.status(400).json({ error: 'Invalid or expired verification link.' });
    }

    await pool.query('UPDATE users SET email_verified = true WHERE id = $1', [matched.user_id]);
    await pool.query('UPDATE email_verification_tokens SET used = true WHERE id = $1', [matched.id]);

    try {
      await logAudit({
        userId: matched.user_id,
        username: null,
        action: 'EMAIL_VERIFIED',
        tableName: 'users',
        recordId: matched.user_id,
        description: 'User verified email address',
        newValues: { email_verified: true },
        req
      });
    } catch (err) {
      console.error('❌ Failed to write audit log for email verification:', err);
    }

    res.json({ success: true, message: 'Email verified. You can now log in.' });
  } catch (err) {
    console.error('Error verifying email:', err);
    res.status(500).json({ error: 'Failed to verify email.' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  const { username, email } = req.body;
  if (!username && !email) {
    return res.status(400).json({ error: 'Provide username or email.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, email, email_verified FROM users WHERE (username = $1 OR email = $2) AND is_active = true',
      [username || null, email || null]
    );
    const user = result.rows[0];

    // Always return success to avoid user enumeration
    if (!user || user.email_verified || !SMTP_CONFIGURED) {
      return res.json({ message: RESEND_VERIFICATION_MESSAGE });
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(verifyToken, 10);
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS);

    // Invalidate old tokens for this user
    await pool.query(
      'UPDATE email_verification_tokens SET used = true WHERE user_id = $1 AND used = false',
      [user.id]
    );

    await pool.query(
      'INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, expiresAt]
    );

    const verifyLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verifyToken}`;
    await sendVerificationEmail(user.email, verifyLink);

    res.json({ message: RESEND_VERIFICATION_MESSAGE });
  } catch (err) {
    console.error('Error resending verification:', err);
    res.status(500).json({ error: 'Failed to resend verification email.' });
  }
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
    role: req.session.role,
    emailVerified: req.session.emailVerified
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