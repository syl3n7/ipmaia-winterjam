#!/bin/sh
# Frontend entrypoint - Sync public files to shared volume

echo "🔄 Syncing public files to shared volume..."

# Copy public files to shared volume if they don't exist
# This preserves existing files (like uploaded PDFs) while ensuring static assets are present
if [ ! -f "/app/public/robots.txt" ]; then
  echo "📁 Initializing shared public folder with static assets..."
  cp -rn /app/public-init/* /app/public/ 2>/dev/null || true
fi

# Always sync images and other static assets (but not PDFs)
echo "🖼️ Syncing static assets..."
cp -r /app/public-init/images /app/public/ 2>/dev/null || true
cp /app/public-init/robots.txt /app/public/ 2>/dev/null || true
cp /app/public-init/sitemap.xml /app/public/ 2>/dev/null || true

echo "✅ Public files synced successfully!"
echo "📂 Contents of /app/public:"
ls -la /app/public/

# Start Next.js server
echo "🚀 Starting Next.js server..."
exec node server.js
