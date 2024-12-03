module.exports = {
  apps: [{
    name: 'jam',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0' 
    }
  }]
};
