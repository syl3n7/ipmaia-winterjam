const io = require('@pm2/io')
export const realtimeUsers = io.metric({
    name: 'Realtime Users'
  })
  
  realtimeUsers.set(23)