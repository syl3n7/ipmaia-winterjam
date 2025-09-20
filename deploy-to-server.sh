#!/bin/bash

# 🚀 Deploy IPMAIA WinterJam to Production Server
# Server: 192.168.1.69

set -e

SERVER_IP="192.168.1.69"
SERVER_USER="lau"  # Change this to your server username
PROJECT_DIR="/home/$SERVER_USER/ipmaia-winterjam"

echo "🚀 Deploying IPMAIA WinterJam to $SERVER_IP"
echo "============================================"

# 1. Copy files to server
echo "📁 Copying files to server..."
rsync -avz --exclude='.git' --exclude='node_modules' --exclude='backend/node_modules' ./ $SERVER_USER@$SERVER_IP:$PROJECT_DIR/

# 2. SSH to server and setup
echo "🔧 Setting up on server..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /home/lau/ipmaia-winterjam

# Create environment file if it doesn't exist
if [ ! -f .env.production ]; then
    echo "⚙️ Creating .env.production from template..."
    cp .env.production.example .env.production
    echo ""
    echo "🔑 IMPORTANT: Edit .env.production with your secrets:"
    echo "   nano .env.production"
    echo ""
    echo "Required changes:"
    echo "   - DB_PASSWORD (strong password)"
    echo "   - JWT_SECRET (random 256+ bit string)"  
    echo "   - SESSION_SECRET (random 256+ bit string)"
    echo "   - OIDC_ISSUER_URL (your OIDC provider URL)"
    echo "   - OIDC_CLIENT_ID (your OIDC client ID)"
    echo "   - OIDC_CLIENT_SECRET (your OIDC client secret)"
    echo "   - OIDC_ADMIN_EMAIL (email that gets admin privileges)"
    echo "   - FRONTEND_URL=http://192.168.1.69"
    echo "   - NEXT_PUBLIC_API_URL=http://192.168.1.69:3001/api"
    echo ""
    read -p "Press Enter after editing .env.production..."
fi

# Start deployment
echo "🐳 Starting deployment with Docker..."
docker-compose -f docker-compose.prod.yml down --remove-orphans
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 30

# Migrate data to database
echo "📊 Migrating game jam data to database..."
docker-compose -f docker-compose.prod.yml exec -T backend node migrate_frontend_data.js

# Check health
echo "🏥 Checking service health..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🎉 Deployment complete!"
echo "🌍 Website: http://192.168.1.69"
echo "🔧 Admin: http://192.168.1.69:3001/admin"
echo "📊 API: http://192.168.1.69:3001/api"
echo ""
echo "📋 To check logs: docker-compose -f docker-compose.prod.yml logs -f"
EOF

echo ""
echo "✅ Deployment script completed!"
echo "🌐 Your site should be available at: http://192.168.1.69"