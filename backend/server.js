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
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

// CSRF Protection middleware with custom header
app.use(csrf({
  header: 'csrf-token' // Match the header name sent by the admin dashboard
}));

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

// API Routes (before static file serving)
app.use('/api/auth', authRoutes);
app.use('/api/gamejams', gameJamRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/frontpage', frontPageRoutes);

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
  // Check if user is authenticated and has admin or super_admin role
  if (!req.session.userId || (req.session.role !== 'admin' && req.session.role !== 'super_admin')) {
    // Redirect to OIDC login for admin access
    return res.redirect('/api/auth/oidc/login');
  }
  next();
};

// Serve admin dashboard static files (with admin protection)
app.use('/admin', requireAdminAccess, express.static(path.join(__dirname, 'admin/dist')));

// Admin dashboard fallback for SPA routing (with admin protection)
app.get('/admin/*', requireAdminAccess, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/dist/index.html'));
});

// Specific route for /admin (without trailing slash, with admin protection)
app.get('/admin', requireAdminAccess, (req, res) => {
  // Read the HTML file and inject CSRF token
  const fs = require('fs');
  const htmlPath = path.join(__dirname, 'admin/dist/index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Get CSRF token from session (lusca stores it here)
  const csrfToken = req.session._csrfSecret || '';
  html = html.replace('</head>', `<meta name="csrf-token" content="${csrfToken}"></head>`);
  
  res.send(html);
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