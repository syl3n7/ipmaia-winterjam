module.exports = {
  apps: [{
    name: 'jam',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0' 
    },
    max_memory_restart: '500M',
    restart_delay: 3000,
    max_restarts: 10,
    autorestart: true
  }]
};
