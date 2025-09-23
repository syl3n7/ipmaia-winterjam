#!/usr/bin/env node

const http = require('http');

/**
 * Health check script to verify backend is responding
 * Returns exit code 0 if healthy, 1 if unhealthy
 */

function checkHealth(port = 3001, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/health',
      method: 'GET',
      timeout: timeout
    }, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ Backend is healthy on port ${port}`);
        resolve(true);
      } else {
        console.log(`❌ Backend unhealthy - status code: ${res.statusCode}`);
        reject(new Error(`Unhealthy status: ${res.statusCode}`));
      }
    });

    req.on('error', (err) => {
      console.log(`❌ Backend health check failed: ${err.message}`);
      reject(err);
    });

    req.on('timeout', () => {
      console.log(`❌ Backend health check timed out after ${timeout}ms`);
      req.destroy();
      reject(new Error('Health check timeout'));
    });

    req.end();
  });
}

// Run health check if called directly
if (require.main === module) {
  const port = process.env.PORT || 3001;
  const timeout = parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000;
  
  checkHealth(port, timeout)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { checkHealth };