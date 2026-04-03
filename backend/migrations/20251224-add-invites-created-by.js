module.exports = {
  up: async (db) => {
    // Ensure the invites table exists first — this migration sorts before
    // 20251224-add-invites-table.js alphabetically, so we guard against that.
    await db.query(`
      CREATE TABLE IF NOT EXISTS invites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    await db.query(`
      ALTER TABLE invites
      ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
    `);
  },
  down: async (db) => {
    await db.query(`
      ALTER TABLE invites DROP COLUMN IF EXISTS created_by;
    `);
  }
};
