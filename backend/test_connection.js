require('dotenv').config();
const { Pool } = require('pg');

console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_PORT:', process.env.DB_PORT);

// Try direct connection first
const pool = new Pool({
  user: process.env.DB_USER || 'lau',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres', // Connect to postgres db first
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

async function testConnection() {
  try {
    console.log('\n🔌 Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connected successfully:', result.rows[0]);
    
    // Now try to drop and recreate the winterjam_local database
    console.log('\n🗑️ Dropping winterjam_local database if it exists...');
    await pool.query('DROP DATABASE IF EXISTS winterjam_local');
    
    console.log('📝 Creating winterjam_local database...');
    await pool.query('CREATE DATABASE winterjam_local');
    
    console.log('✅ Database winterjam_local created successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();