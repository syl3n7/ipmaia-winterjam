#!/bin/bash

# Docker startup script with automated migration
# This script waits for the backend to be healthy, then runs migrations

set -e

echo "🐳 Docker startup with auto-migration"
echo "Starting backend server in background..."

# Start the backend server in background
npm start &
BACKEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "🧹 Cleaning up..."
    kill $BACKEND_PID 2>/dev/null || true
    wait $BACKEND_PID 2>/dev/null || true
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Configurable startup delay (default: 10 seconds)
STARTUP_DELAY=${STARTUP_DELAY:-10}
echo "⏳ Giving backend ${STARTUP_DELAY} seconds to initialize..."
sleep $STARTUP_DELAY

echo "⏳ Now checking if backend is healthy and running migrations..."

# Wait for backend health and run migration with enhanced error handling
if npm run migrate:auto; then
    echo "✅ Auto-migration completed successfully!"
else
    echo "❌ Auto-migration failed!"
    echo "📋 Backend logs (last 20 lines):"
    tail -20 /proc/$BACKEND_PID/fd/1 2>/dev/null || echo "Could not retrieve backend logs"
    exit 1
fi

echo "🎉 Backend is ready with migrations applied!"

# Keep the backend running (bring to foreground)
wait $BACKEND_PID