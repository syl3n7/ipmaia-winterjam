const { Pool } = require('pg');

// In development, we can work without database for basic functionality
// But enable it if DEV_BYPASS_AUTH is true for testing with real database
if (process.env.NODE_ENV !== 'production' && process.env.DEV_BYPASS_AUTH !== 'true') {
  console.log('⚠️ Development mode: Database connection disabled for easier testing');
  module.exports = {
    pool: {
      query: async () => ({ rows: [] }),
      connect: async () => ({}),
      end: async () => {}
    }
  };
  return;
}

const pool = new Pool({
  user: process.env.DB_USER || 'winterjam',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'winterjam_db',
  password: process.env.DB_PASSWORD || 'winterjam_password',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

module.exports = { pool };