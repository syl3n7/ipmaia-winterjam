#!/usr/bin/env node

const { spawn } = require('child_process');
const { checkHealth } = require('./health-check');

/**
 * Automated migration runner that waits for backend health before running migrations
 * Usage: node scripts/auto-migrate.js [port] [max-retries] [retry-delay]
 */

const PORT = process.argv[2] || process.env.PORT || 3001;
const MAX_RETRIES = parseInt(process.argv[3]) || 30; // 30 retries = 5 minutes with 10s delay
const RETRY_DELAY = parseInt(process.argv[4]) || 10000; // 10 seconds between retries

async function waitForHealth(retries = 0) {
  console.log(`🔍 Checking backend health (attempt ${retries + 1}/${MAX_RETRIES})...`);
  
  try {
    await checkHealth(PORT);
    return true;
  } catch (error) {
    if (retries >= MAX_RETRIES - 1) {
      console.error(`❌ Backend failed to become healthy after ${MAX_RETRIES} attempts`);
      console.error(`Last error: ${error.message}`);
      return false;
    }
    
    console.log(`⏳ Backend not ready yet, retrying in ${RETRY_DELAY/1000}s...`);
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    return waitForHealth(retries + 1);
  }
}

function runMigration() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting database migration...');
    
    const migration = spawn('node', ['scripts/migrate.js'], {
      cwd: __dirname + '/..',
      stdio: 'inherit'
    });
    
    migration.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Migration completed successfully!');
        resolve();
      } else {
        console.error(`❌ Migration failed with exit code ${code}`);
        reject(new Error(`Migration process exited with code ${code}`));
      }
    });
    
    migration.on('error', (error) => {
      console.error('❌ Failed to start migration process:', error.message);
      reject(error);
    });
  });
}

async function main() {
  console.log('🎯 Auto-migration starting...');
  console.log(`Configuration:
  - Port: ${PORT}
  - Max retries: ${MAX_RETRIES}
  - Retry delay: ${RETRY_DELAY}ms
  `);
  
  try {
    // Wait for backend to be healthy
    const isHealthy = await waitForHealth();
    
    if (!isHealthy) {
      console.error('❌ Auto-migration failed: Backend never became healthy');
      process.exit(1);
    }
    
    // Run migration
    await runMigration();
    
    console.log('🎉 Auto-migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Auto-migration failed:', error.message);
    process.exit(1);
  }
}

// Handle interruption gracefully
process.on('SIGINT', () => {
  console.log('\n⚠️  Auto-migration interrupted by user');
  process.exit(130);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Auto-migration terminated');
  process.exit(143);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { waitForHealth, runMigration };