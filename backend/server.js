const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');
const path = require('path');
const csrf = require('lusca').csrf;
require('dotenv').config();

const { pool } = require('./config/database');
const authRoutes = require('./routes/auth');
const gameJamRoutes = require('./routes/gamejams');
const gameRoutes = require('./routes/games');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const frontPageRoutes = require('./routes/frontpage');
const rulesRoutes = require('./routes/rules');
const sponsorRoutes = require('./routes/sponsors');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy (important for reverse proxy setups like Zoraxy/NPM)
app.set('trust proxy', 1);

// Debug middleware for proxy headers (remove in production)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('🔍 Proxy Headers Debug:', {
      host: req.get('host'),
      'x-forwarded-host': req.get('x-forwarded-host'),
      'x-forwarded-proto': req.get('x-forwarded-proto'),
      'x-forwarded-for': req.get('x-forwarded-for'),
      'x-real-ip': req.get('x-real-ip'),
      secure: req.secure,
      protocol: req.protocol
    });
    next();
  });
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-hashes'", "https://static.cloudflareinsights.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://cloudflareinsights.com"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin images
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 60 * 1000, // 15 min prod, 1 hour dev
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 100 req prod, 1000 req dev
  message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow specific frontend URL for credentials
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://ipmaia-winterjam.pt',
      'http://localhost:3000',
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now (public API)
    }
  },
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
app.use(morgan('combined'));

// Session configuration
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'user_sessions'
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

// CSRF Protection middleware - skip for admin API routes
app.use((req, res, next) => {
  // Skip CSRF for admin API routes (already protected by session auth)
  if (req.path.startsWith('/api/admin') || 
      req.path.startsWith('/api/rules/admin') || 
      req.path.startsWith('/api/frontpage/admin')) {
    return next();
  }
  // Apply CSRF for other routes
  csrf({ header: 'csrf-token' })(req, res, next);
});

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization (required for sessions)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error);
  }
});

// Serve static files (uploaded images, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve admin static assets (CSS, JS) - specific files only, not HTML
app.get('/admin/styles.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, 'admin/dist/styles.css'));
});

app.get('/admin/admin.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'admin/dist/admin.js'));
});

app.get('/admin/admin.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, 'admin/dist/admin.css'));
});

// Serve favicon for admin panel
app.get('/favicon.ico', (req, res) => {
  // Send a 204 No Content response to suppress the error
  res.status(204).end();
});

// API Routes (before static file serving)
app.use('/api/auth', authRoutes);
app.use('/api/gamejams', gameJamRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/frontpage', frontPageRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/sponsors', sponsorRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Debug endpoint to check file system
app.get('/debug/files', (req, res) => {
  const fs = require('fs');
  const adminPath = path.join(__dirname, 'admin');
  const adminDistPath = path.join(__dirname, 'admin/dist');
  
  try {
    const adminExists = fs.existsSync(adminPath);
    const adminDistExists = fs.existsSync(adminDistPath);
    const indexExists = fs.existsSync(path.join(adminDistPath, 'index.html'));
    
    res.json({
      adminPath,
      adminDistPath,
      adminExists,
      adminDistExists,
      indexExists,
      files: adminDistExists ? fs.readdirSync(adminDistPath) : 'admin/dist not found'
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Admin middleware for dashboard access
const requireAdminAccess = (req, res, next) => {
  // In development with auth bypass, or when DEV_BYPASS_AUTH is enabled, skip authentication checks
  if (process.env.DEV_BYPASS_AUTH === 'true') {
    // Simulate admin user session for development
    req.session.userId = req.session.userId || 1;
    req.session.username = req.session.username || 'dev-admin';
    req.session.role = req.session.role || 'super_admin';
    return next();
  }

  // Check if user is authenticated and has admin or super_admin role
  if (!req.session.userId || (req.session.role !== 'admin' && req.session.role !== 'super_admin')) {
    // Redirect to OIDC login for admin access
    return res.redirect('/api/auth/oidc/login');
  }
  next();
};

// Serve admin dashboard - single page application
app.get('/admin', requireAdminAccess, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/dist/index.html'));
});

app.get('/admin/gamejams', requireAdminAccess, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/dist/index.html'));
});

app.get('/admin/games', requireAdminAccess, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/dist/index.html'));
});

app.get('/admin/users', requireAdminAccess, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/dist/index.html'));
});

app.get('/admin/sponsors', requireAdminAccess, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/dist/index.html'));
});

app.get('/admin/frontpage', requireAdminAccess, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/dist/index.html'));
});

app.get('/admin/rules', requireAdminAccess, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/dist/index.html'));
});

app.get('/admin/system', requireAdminAccess, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/dist/index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request Method:', req.method);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`🔧 API endpoints: http://localhost:${PORT}/api`);
});

module.exports = app;