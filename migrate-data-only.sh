#!/bin/bash

# 🔄 Manual Data Migration Script
# Run this to migrate data without full deployment

echo "📊 IPMAIA WinterJam - Data Migration"
echo "===================================="

# Check if Docker services are running
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "❌ Docker services are not running!"
    echo "Please start services first: docker-compose -f docker-compose.prod.yml up -d"
    exit 1
fi

echo "🔄 Running data migration..."
docker-compose -f docker-compose.prod.yml exec backend node migrate-data.js

echo ""
echo "✅ Data migration completed!"
echo "🌐 Check your site: http://192.168.1.69"
echo "🔧 Admin panel: http://192.168.1.69:3001/admin"