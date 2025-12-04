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

// Middleware to extract and attach client info to request
app.use((req, res, next) => {
  // Get real IP address (considering proxy headers)
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                   req.headers['x-real-ip'] ||
                   req.ip ||
                   req.connection.remoteAddress;
  
  // Get user agent
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  // Attach to request for easy access
  req.clientInfo = {
    ip: clientIp,
    userAgent: userAgent,
    forwardedFor: req.headers['x-forwarded-for'],
    realIp: req.headers['x-real-ip']
  };
  
  next();
});

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
  max: (req, res) => {
    if (req.session && req.session.role === 'super_admin') {
      return process.env.NODE_ENV === 'production' ? 1000 : 10000; // Higher limit for super admins
    }
    return process.env.NODE_ENV === 'production' ? 100 : 1000; // Standard limits
  },
  message: 'Too many requests from this IP, please try again later.',
  // Skip rate limiting for internal Docker network requests
  skip: (req) => {
    const ip = req.ip || req.connection.remoteAddress || '';
    // Docker bridge network typically uses 172.x.x.x range
    // Also skip localhost and private network ranges
    const isInternalIP = 
      ip.startsWith('172.') ||      // Docker default bridge network
      ip.startsWith('10.') ||        // Private network
      ip.startsWith('192.168.') ||   // Private network
      ip === '::1' ||                // IPv6 localhost
      ip === '127.0.0.1' ||          // IPv4 localhost
      ip === '::ffff:127.0.0.1';     // IPv4-mapped IPv6 localhost
    
    if (isInternalIP && process.env.NODE_ENV === 'production') {
      console.log(`⚡ Skipping rate limit for internal IP: ${ip}`);
    }
    
    return isInternalIP;
  }
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
      req.path.startsWith('/api/frontpage/admin') ||
      req.path.startsWith('/api/sponsors/upload-logo') ||
      req.path.startsWith('/api/sponsors/admin') ||
      (req.path.match(/^\/api\/sponsors\/\d+$/) && (req.method === 'PUT' || req.method === 'DELETE')) ||
      (req.path === '/api/sponsors' && req.method === 'POST')) {
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

// ADMIN INTERFACE: Redirect to Next.js admin panel
// All /admin requests are redirected to the frontend at /admin
app.get('/admin*', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/admin`);
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
    version: process.env.APP_VERSION || '1.0.0-dev',
    buildDate: process.env.BUILD_DATE || 'unknown',
    gitSha: process.env.GIT_SHA || 'unknown'
  });
});

// Version endpoint
app.get('/api/version', (req, res) => {
  res.json({
    service: 'backend',
    version: process.env.APP_VERSION || '1.0.0-dev',
    buildDate: process.env.BUILD_DATE || 'unknown',
    gitSha: process.env.GIT_SHA || 'unknown',
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
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
  console.log(`🔧 API endpoints: http://localhost:${PORT}/api`);
  console.log(`📊 Admin interface: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin`);
});

module.exports = app;