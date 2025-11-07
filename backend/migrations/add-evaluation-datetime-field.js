/**
 * Migration: Add evaluation_datetime field to game_jams table
 * This allows admins to set a specific time for project evaluation
 */

module.exports = {
  up: async (pool) => {
    console.log('Adding evaluation_datetime column to game_jams table...');
    
    await pool.query(`
      ALTER TABLE game_jams 
      ADD COLUMN IF NOT EXISTS evaluation_datetime TIMESTAMP WITH TIME ZONE;
    `);
    
    console.log('✅ evaluation_datetime column added successfully');
  },

  down: async (pool) => {
    console.log('Removing evaluation_datetime column from game_jams table...');
    
    await pool.query(`
      ALTER TABLE game_jams 
      DROP COLUMN IF EXISTS evaluation_datetime;
    `);
    
    console.log('✅ evaluation_datetime column removed successfully');
  }
};
