const { Pool } = require('pg');

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