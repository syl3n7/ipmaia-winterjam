module.exports = {
  apps: [{
    name: 'jam',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      HOST: '0.0.0.0' 
    }
  }]
};
