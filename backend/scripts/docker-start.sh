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

echo "⏳ Waiting for backend to be healthy..."

# Wait for backend health and run migration
if npm run migrate:auto; then
    echo "✅ Auto-migration completed successfully!"
else
    echo "❌ Auto-migration failed!"
    exit 1
fi

echo "🎉 Backend is ready with migrations applied!"

# Keep the backend running (bring to foreground)
wait $BACKEND_PID