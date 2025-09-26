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

# Check if backend process is still running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend process died during initialization!"
    exit 1
fi

# Give backend additional time to fully initialize database connections
echo "⏳ Allowing backend to establish database connections..."
sleep 5

echo "⏳ Now running database migrations..."

# Run migration directly instead of using the health check approach
if npm run migrate; then
    echo "✅ Migration completed successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi

echo "🌱 Running database seeding..."

# Run seeding
if npm run seed; then
    echo "✅ Seeding completed successfully!"
else
    echo "❌ Seeding failed!"
    exit 1
fi

echo "🎉 Backend is ready with migrations and data applied!"

# Keep the backend running (bring to foreground)
wait $BACKEND_PID