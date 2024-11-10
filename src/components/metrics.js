// metrics.js
let io;
if (typeof window === 'undefined') {
  io = require('@pm2/io');
}

let activeUsers = 0;
let realtimeUsers, reqPerSec;

// Initialize metrics only if `io` is available
if (io) {
  // Real-time Users Metric
  realtimeUsers = io.metric({
    name: 'Realtime Users',
    id: 'app/realtime/users',
  });

  // Requests per Second (Meter) Metric
  reqPerSec = io.meter({
    name: 'req/sec',
    id: 'app/requests/volume',
  });
}

// Update user count and request frequency
function updateRealtimeUsers(count) {
  if (realtimeUsers) {
    activeUsers = count;
    realtimeUsers.set(activeUsers);
  }
}

module.exports = {
  incrementUserCount: () => updateRealtimeUsers(++activeUsers),
  decrementUserCount: () => updateRealtimeUsers(--activeUsers),
  markRequest: () => reqPerSec && reqPerSec.mark(),
};
