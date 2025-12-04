#!/bin/bash

# IPMAIA WinterJam - Docker Production Deployment Script
set -e

echo "🚀 Starting IPMAIA WinterJam Docker production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo -e "${YELLOW}📝 Please create .env with your production values${NC}"
    echo -e "${BLUE}Required variables: DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, SESSION_SECRET, FRONTEND_URL, NEXT_PUBLIC_API_URL, OIDC_* variables${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment configuration found${NC}"

# Create required directories
echo -e "${BLUE}📁 Creating required directories...${NC}"
mkdir -p ssl
mkdir -p backend/uploads
mkdir -p backend/uploads/sponsors

# Make scripts executable
chmod +x backend/scripts/*.js 2>/dev/null || true

# Enable maintenance mode (nginx must stay up to show maintenance page)
echo -e "${YELLOW}🚧 Enabling maintenance mode...${NC}"

# Create maintenance flag directory and file on host
mkdir -p /tmp/maintenance_flag
touch /tmp/maintenance_flag/maintenance.on
echo "Maintenance mode enabled at $(date)" > /tmp/maintenance_flag/maintenance.on

# Ensure nginx is running to show maintenance page
docker compose -f docker-compose.prod.yml up -d nginx
sleep 3

# Verify maintenance mode is active
if [ -f /tmp/maintenance_flag/maintenance.on ]; then
    echo -e "${GREEN}✅ Maintenance mode activated${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Could not verify maintenance mode${NC}"
fi

# Stop application services (keep nginx and db up)
echo -e "${YELLOW}🛑 Stopping application services...${NC}"
docker compose -f docker-compose.prod.yml stop backend frontend 2>/dev/null || true
docker compose -f docker-compose.prod.yml rm -f backend frontend 2>/dev/null || true

# Pull latest images from registry
echo -e "${BLUE}📥 Pulling latest images from registry...${NC}"
docker compose -f docker-compose.prod.yml pull frontend backend || {
    echo -e "${YELLOW}⚠️  Could not pull images. Make sure you're authenticated to GitHub Container Registry.${NC}"
    echo -e "${BLUE}📝 Run: echo \$GITHUB_PAT | docker login ghcr.io -u USERNAME --password-stdin${NC}"
}

# Check if SSL certificates exist
if [ ! -f ssl/fullchain.pem ] || [ ! -f ssl/privkey.pem ]; then
    echo -e "${YELLOW}⚠️  SSL certificates not found in ./ssl/ directory${NC}"
    echo -e "${BLUE}📝 You have two options:${NC}"
    echo "   1. Place your SSL certificates in ./ssl/fullchain.pem and ./ssl/privkey.pem"
    echo "   2. Use Let's Encrypt with the provided script: ./setup-ssl.sh"
    echo ""
    read -p "Do you want to continue without SSL? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🛑 Deployment cancelled. Please set up SSL certificates first.${NC}"
        exit 1
    fi
    echo -e "${YELLOW}⚠️  Continuing without SSL - only HTTP will be available${NC}"
fi

# Start services with pulled images
echo -e "${BLUE}🚀 Starting services...${NC}"
docker compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
timeout=300
elapsed=0
interval=10

while [ $elapsed -lt $timeout ]; do
    # Check if all services are running
    if docker compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        echo -e "${GREEN}✅ Services are starting up!${NC}"

        # Wait a bit more for full initialization
        sleep 20

        # Try to check backend health
        if docker compose -f docker-compose.prod.yml exec -T backend curl -f http://localhost:3001/health &>/dev/null; then
            echo -e "${GREEN}✅ Backend is healthy!${NC}"
            break
        fi
    fi

    if [ $((elapsed % 30)) -eq 0 ]; then
        echo -e "${YELLOW}⏳ Still waiting for services... (${elapsed}s/${timeout}s)${NC}"
        docker compose -f docker-compose.prod.yml ps
    fi

    sleep $interval
    elapsed=$((elapsed + interval))
done

if [ $elapsed -ge $timeout ]; then
    echo -e "${RED}❌ Timeout waiting for services to be ready${NC}"
    echo -e "${YELLOW}📋 Service status:${NC}"
    docker compose -f docker-compose.prod.yml ps
    echo -e "${YELLOW}📋 Recent logs:${NC}"
    docker compose -f docker-compose.prod.yml logs --tail=20
    exit 1
fi

# Run database migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
sleep 5  # Give DB more time to be ready
docker compose -f docker-compose.prod.yml exec -T backend npm run migrate 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Migration script not available, database should auto-initialize${NC}"
}

# Show final status
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
docker compose -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}🌐 Your application is now running at:${NC}"
if [ -f ssl/fullchain.pem ]; then
    echo -e "${BLUE}   🌍 Website: https://ipmaia-winterjam.pt${NC}"
    echo -e "${BLUE}   🔧 API: https://api.ipmaia-winterjam.pt/api${NC}"
    echo -e "${BLUE}   ⚙️  Admin: https://api.ipmaia-winterjam.pt/admin${NC}"
else
    echo -e "${YELLOW}   🌍 Website: http://ipmaia-winterjam.pt${NC}"
    echo -e "${YELLOW}   🔧 API: http://api.ipmaia-winterjam.pt/api${NC}"
    echo -e "${YELLOW}   ⚙️  Admin: http://api.ipmaia-winterjam.pt/admin${NC}"
    echo -e "${YELLOW}   ⚠️  SSL not configured - using HTTP only${NC}"
fi

echo ""
echo -e "${YELLOW}📝 Useful commands:${NC}"
echo "   📋 View logs: docker compose -f docker-compose.prod.yml logs -f [service-name]"
echo "   🔄 Restart: docker compose -f docker-compose.prod.yml restart [service-name]"
echo "   🛑 Stop all: docker compose -f docker-compose.prod.yml down"
echo "   🗄️  Database shell: docker compose -f docker-compose.prod.yml exec db psql -U postgres winterjam"
echo ""

# Disable maintenance mode
echo -e "${BLUE}🎉 Disabling maintenance mode...${NC}"
rm -f /tmp/maintenance_flag/maintenance.on 2>/dev/null || true
sleep 2

if [ ! -f /tmp/maintenance_flag/maintenance.on ]; then
    echo -e "${GREEN}✅ Maintenance mode disabled${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Could not disable maintenance mode${NC}"
fi

# Health checks
echo -e "${BLUE}🏥 Performing health checks...${NC}"
sleep 2

if docker compose -f docker-compose.prod.yml exec -T backend curl -f http://localhost:3001/health &>/dev/null; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed - service might still be starting${NC}"
fi

echo ""
echo -e "${GREEN}✨ Happy game jamming! 🎮${NC}"