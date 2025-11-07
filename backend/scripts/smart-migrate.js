#!/usr/bin/env node

/**
 * Smart Migration System
 * Only runs migrations that haven't been applied yet
 * Tracks migration history in a database table
 */

require('dotenv').config();
const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

// Create migrations tracking table
async function createMigrationsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Migrations tracking table ready');
  } catch (error) {
    console.error('❌ Error creating migrations table:', error);
    throw error;
  }
}

// Check if a migration has been applied
async function isMigrationApplied(migrationName) {
  const result = await pool.query(
    'SELECT 1 FROM schema_migrations WHERE migration_name = $1',
    [migrationName]
  );
  return result.rows.length > 0;
}

// Record that a migration has been applied
async function recordMigration(migrationName) {
  await pool.query(
    'INSERT INTO schema_migrations (migration_name) VALUES ($1) ON CONFLICT (migration_name) DO NOTHING',
    [migrationName]
  );
}

// Run base migration to create initial schema
async function runBaseMigration() {
  const migrationName = 'base_schema';
  
  if (await isMigrationApplied(migrationName)) {
    console.log(`⏭️  Skipping ${migrationName} (already applied)`);
    return;
  }

  console.log(`🔄 Running ${migrationName}...`);
  console.log(`⚠️  Base schema should already exist. Marking as applied.`);
  await recordMigration(migrationName);
  console.log(`✅ ${migrationName} marked as completed`);
}

// Run individual migration files
async function runMigrationFiles() {
  const migrationsDir = path.join(__dirname, '../migrations');
  
  // Check if migrations directory exists
  if (!fs.existsSync(migrationsDir)) {
    console.log('📁 No migrations directory found, skipping additional migrations');
    return;
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.js'))
    .sort(); // Run migrations in alphabetical order

  for (const file of files) {
    const migrationName = file.replace('.js', '');
    
    if (await isMigrationApplied(migrationName)) {
      console.log(`⏭️  Skipping ${migrationName} (already applied)`);
      continue;
    }

    console.log(`🔄 Running ${migrationName}...`);
    
    try {
      const migration = require(path.join(migrationsDir, file));
      
      if (typeof migration.up === 'function') {
        await migration.up(pool);
        await recordMigration(migrationName);
        console.log(`✅ ${migrationName} completed`);
      } else {
        console.warn(`⚠️  ${migrationName} has no 'up' function, skipping`);
      }
    } catch (error) {
      console.error(`❌ Error running ${migrationName}:`, error);
      throw error;
    }
  }
}

// Main migration runner
async function smartMigrate() {
  console.log('🚀 Starting smart migration system...');
  
  try {
    // Step 1: Create migrations tracking table
    await createMigrationsTable();
    
    // Step 2: Run base schema (tables, indexes)
    await runBaseMigration();
    
    // Step 3: Run additional migration files
    await runMigrationFiles();
    
    // Get migration count
    const result = await pool.query('SELECT COUNT(*) as count FROM schema_migrations');
    const count = result.rows[0].count;
    
    console.log(`🎉 Migration complete! ${count} migrations applied in total.`);
    return true;
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  smartMigrate()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { smartMigrate };
