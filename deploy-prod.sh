#!/bin/bash

# IPMAIA WinterJam - Production Deployment Script
set -e

echo "🚀 Starting IPMAIA WinterJam production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production file not found!${NC}"
    echo -e "${YELLOW}📝 Please copy .env.production.example to .env.production and fill in the values${NC}"
    echo -e "${BLUE}Example: cp .env.production.example .env.production${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment configuration found${NC}"

# Create required directories
echo -e "${BLUE}📁 Creating required directories...${NC}"
mkdir -p ssl
mkdir -p backend/uploads

# Make scripts executable
chmod +x backend/scripts/*.js 2>/dev/null || true

# Stop existing containers (if any)
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down --volumes --remove-orphans 2>/dev/null || true

# Remove old images (optional - uncomment to clean up)
# echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
# docker system prune -f || true

# Build and start services
echo -e "${BLUE}🏗️  Building and starting services...${NC}"
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
timeout=180
elapsed=0
interval=10

while [ $elapsed -lt $timeout ]; do
    # Check if all services are running
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        echo -e "${GREEN}✅ Services are starting up!${NC}"
        
        # Wait a bit more for full initialization
        sleep 20
        
        # Try to check backend health
        if curl -f http://localhost:3001/health &>/dev/null; then
            echo -e "${GREEN}✅ Backend is healthy!${NC}"
            break
        fi
    fi
    
    if [ $((elapsed % 30)) -eq 0 ]; then
        echo -e "${YELLOW}⏳ Still waiting for services... (${elapsed}s/${timeout}s)${NC}"
        docker-compose -f docker-compose.prod.yml ps
    fi
    
    sleep $interval
    elapsed=$((elapsed + interval))
done

if [ $elapsed -ge $timeout ]; then
    echo -e "${RED}❌ Timeout waiting for services to be ready${NC}"
    echo -e "${YELLOW}📋 Service status:${NC}"
    docker-compose -f docker-compose.prod.yml ps
    echo -e "${YELLOW}📋 Recent logs:${NC}"
    docker-compose -f docker-compose.prod.yml logs --tail=20
    exit 1
fi

# Run database migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
sleep 5  # Give DB more time to be ready
docker-compose -f docker-compose.prod.yml exec -T backend npm run migrate 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Migration script not available, database should auto-initialize${NC}"
}

# Show final status
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}🌐 Your application is now running at:${NC}"
echo -e "${BLUE}   🌍 Website: http://localhost (via Nginx)${NC}"
echo -e "${BLUE}   🖥️  Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}   🔧 Backend API: http://localhost:3001/api${NC}"
echo -e "${BLUE}   ⚙️  Admin Panel: http://localhost:3001/admin${NC}"
echo ""

# Health checks
echo -e "${BLUE}🏥 Performing health checks...${NC}"
sleep 2

if curl -f http://localhost:3001/health &>/dev/null; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed - service might still be starting${NC}"
fi

if curl -f http://localhost:3000 &>/dev/null; then
    echo -e "${GREEN}✅ Frontend health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend health check failed - service might still be starting${NC}"
fi

echo ""
echo -e "${YELLOW}📝 Useful commands:${NC}"
echo "   📋 View logs: docker-compose -f docker-compose.prod.yml logs -f [service-name]"
echo "   🔄 Restart: docker-compose -f docker-compose.prod.yml restart [service-name]"
echo "   🛑 Stop all: docker-compose -f docker-compose.prod.yml down"
echo "   🗄️  Database shell: docker-compose -f docker-compose.prod.yml exec db psql -U postgres winterjam"
echo ""

echo -e "${GREEN}✨ Happy game jamming! 🎮${NC}"
echo -e "${BLUE}Don't forget to configure your domain and SSL certificates for production!${NC}"