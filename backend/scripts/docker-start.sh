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

echo "🔄 Adding toggle fields to existing tables..."

# Run toggle fields migration to add missing columns
if node scripts/add-toggle-fields.js; then
    echo "✅ Toggle fields migration completed successfully!"
else
    echo "⚠️ Toggle fields migration failed (might already exist)"
fi

echo "🔄 Setting up rules table..."

# Run new rules migration
if node scripts/migrate-rules.js; then
    echo "✅ Rules table migration completed successfully!"
else
    echo "⚠️ Rules table migration failed (might already exist)"
fi

echo "🔄 Adding slug and archive_url fields..."

# Run slug fields migration
if node scripts/add-slug-fields.js; then
    echo "✅ Slug fields migration completed successfully!"
else
    echo "⚠️ Slug fields migration failed (might already exist)"
fi

echo "🔄 Migrating frontend data..."

# Run frontend data migration
if node migrate_frontend_data.js; then
    echo "✅ Frontend data migration completed successfully!"
else
    echo "❌ Frontend data migration failed!"
    exit 1
fi

echo "🔄 Adding December 2025 WinterJam..."

# Add December 2025 jam
if node scripts/add-december-2025-jam.js; then
    echo "✅ December 2025 jam added successfully!"
else
    echo "⚠️ December 2025 jam addition failed (might already exist)"
fi

echo "🎉 Backend is ready with migrations and data applied!"

# Keep the backend running (bring to foreground)
wait $BACKEND_PID