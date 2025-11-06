#!/bin/bash

# Docker Volumes Information for WinterJam
# This script shows information about your Docker volumes

echo "🐳 WinterJam Docker Volumes Status"
echo "===================================="
echo ""

echo "📦 Named Volumes:"
docker volume ls | grep -E "postgres_data|backend_uploads|winterjam" || echo "No volumes found"

echo ""
echo "💾 Volume Details:"
echo ""

# Postgres data volume
echo "1️⃣  PostgreSQL Data (postgres_data):"
docker volume inspect ipmaia-winterjam_postgres_data 2>/dev/null | grep -E "Mountpoint|Name" || echo "   Not yet created (will be created on first run)"

echo ""

# Backend uploads volume
echo "2️⃣  Backend Uploads (backend_uploads):"
docker volume inspect ipmaia-winterjam_backend_uploads 2>/dev/null | grep -E "Mountpoint|Name" || echo "   Not yet created (will be created on first run)"

echo ""
echo "📊 Volume Sizes:"
docker system df -v | grep -A 10 "Local Volumes" | grep -E "ipmaia-winterjam|VOLUME NAME"

echo ""
echo "ℹ️  What persists in volumes:"
echo "   • postgres_data: All database data (jams, games, rules, users)"
echo "   • backend_uploads: Uploaded files (if any)"
echo ""
echo "✅ Data WILL persist through:"
echo "   • Container restarts (docker-compose restart)"
echo "   • Container recreation (docker-compose up -d)"
echo "   • System reboots"
echo ""
echo "⚠️  Data will be LOST if:"
echo "   • You run: docker-compose down -v (removes volumes)"
echo "   • You manually delete volumes: docker volume rm <volume>"
echo ""
echo "💡 Tip: Use ./backup-restore.sh backup to create backups!"
