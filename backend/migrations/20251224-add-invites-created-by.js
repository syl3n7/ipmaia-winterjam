module.exports = {
  up: async (db) => {
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
