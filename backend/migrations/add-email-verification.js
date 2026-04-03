const { pool } = require('../config/database');

async function addEmailVerification() {
  try {
    console.log('🔄 Adding email verification support...');

    // Add email_verified column to users table
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false
    `);

    // Existing users are considered verified (they were already operational)
    await pool.query(`
      UPDATE users SET email_verified = true WHERE email_verified = false OR email_verified IS NULL
    `);

    // Create email_verification_tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Email verification migration complete');
  } catch (err) {
    console.error('❌ Email verification migration failed:', err);
    throw err;
  }
}

module.exports = { up: addEmailVerification };

if (require.main === module) {
  addEmailVerification().then(() => process.exit(0)).catch(() => process.exit(1));
}
