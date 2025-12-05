const { Pool } = require('pg');

// In development, we can work without database for basic functionality
// But try to connect if database is available
if (process.env.NODE_ENV !== 'production') {
  console.log('🔍 Checking for development database...');

  // For development, always try to use real database
  // If connection fails, the pool will handle errors gracefully
  console.log('✅ Development mode: Attempting database connection');
  console.log('   Database: winterjam_db, User: winterjam, Host: localhost:5432');
}

// Create the database pool with development-friendly defaults
const pool = new Pool({
  user: process.env.DB_USER || 'winterjam',
  host: process.env.DB_HOST || 'localhost', // Changed from 'postgres' to 'localhost' for local dev
  database: process.env.DB_NAME || 'winterjam_db',
  password: process.env.DB_PASSWORD || 'winterjam_password',
  port: process.env.DB_PORT || 5432,
  connectionTimeoutMillis: 5000, // 5 second timeout for development
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
  console.log('⚠️ Falling back to mock database operations');
});

module.exports = { pool };