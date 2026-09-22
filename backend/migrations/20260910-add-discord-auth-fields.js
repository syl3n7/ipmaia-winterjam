// Migration: add Discord auth and invite support
module.exports = {
  up: async (db) => {
    await db.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS discord_user_id VARCHAR(255) UNIQUE,
        ADD COLUMN IF NOT EXISTS discord_username VARCHAR(255),
        ADD COLUMN IF NOT EXISTS discord_avatar_url TEXT,
        ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(32) DEFAULT 'local',
        ADD COLUMN IF NOT EXISTS discord_linked_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS last_discord_login_at TIMESTAMP WITH TIME ZONE;
    `);

    await db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_discord_user_id_unique
      ON users(discord_user_id)
      WHERE discord_user_id IS NOT NULL;
    `);

    await db.query(`
      ALTER TABLE invites
        ADD COLUMN IF NOT EXISTS invite_type VARCHAR(32) DEFAULT 'email',
        ADD COLUMN IF NOT EXISTS discord_user_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS discord_username VARCHAR(255),
        ADD COLUMN IF NOT EXISTS source VARCHAR(32) DEFAULT 'admin_panel',
        ADD COLUMN IF NOT EXISTS claimed_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS invites_discord_user_id_idx
      ON invites(discord_user_id)
      WHERE discord_user_id IS NOT NULL;
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS invites_claimed_by_user_id_idx
      ON invites(claimed_by_user_id)
      WHERE claimed_by_user_id IS NOT NULL;
    `);
  },

  down: async (db) => {
    await db.query(`
      ALTER TABLE invites
        DROP COLUMN IF EXISTS claimed_at,
        DROP COLUMN IF EXISTS claimed_by_user_id,
        DROP COLUMN IF EXISTS source,
        DROP COLUMN IF EXISTS discord_username,
        DROP COLUMN IF EXISTS discord_user_id,
        DROP COLUMN IF EXISTS invite_type;
    `);

    await db.query(`
      ALTER TABLE users
        DROP COLUMN IF EXISTS last_discord_login_at,
        DROP COLUMN IF EXISTS discord_linked_at,
        DROP COLUMN IF EXISTS auth_provider,
        DROP COLUMN IF EXISTS discord_avatar_url,
        DROP COLUMN IF EXISTS discord_username,
        DROP COLUMN IF EXISTS discord_user_id;
    `);
  }
};
