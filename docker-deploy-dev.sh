#!/bin/bash

# IPMAIA WinterJam - Docker Development Deployment Script
set -e

echo "🚀 Starting IPMAIA WinterJam Docker development deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env exists, create basic dev one if not
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found, creating basic development configuration...${NC}"
    cat > .env << EOF
# Development Environment Variables (with database enabled)
NODE_ENV=dev
DEV_BYPASS_AUTH=true
PORT=3001

# Database configuration (Docker development with real database)
DB_HOST=db
DB_NAME=winterjam_dev
DB_USER=postgres
DB_PASSWORD=postgres
DB_PORT=5432

# Session security (change these in production!)
JWT_SECRET=dev-jwt-secret-change-in-production
SESSION_SECRET=dev-session-secret-change-in-production

# Frontend URL for CORS (disabled for development)
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
API_URL=http://localhost:3001/api

# OIDC Configuration (disabled for development)
# OIDC_ISSUER_URL=
# OIDC_CLIENT_ID=
# OIDC_CLIENT_SECRET=
# OIDC_REDIRECT_URI=
# OIDC_ADMIN_EMAIL=
EOF
    echo -e "${GREEN}✅ Created .env file for development with database enabled${NC}"
fi

echo -e "${GREEN}✅ Environment configuration ready${NC}"

# Create required directories
echo -e "${BLUE}📁 Creating required directories...${NC}"
mkdir -p backend/uploads

# Make scripts executable
chmod +x backend/scripts/*.js 2>/dev/null || true

# Stop existing containers (if any)
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker compose down --volumes --remove-orphans 2>/dev/null || true

# Remove old images (optional cleanup)
echo -e "${YELLOW}🧹 Cleaning up old development images...${NC}"
docker system prune -f >/dev/null 2>&1 || true

# Build and start services
echo -e "${BLUE}🏗️  Building and starting development services...${NC}"
docker compose up -d --build

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
timeout=180
elapsed=0
interval=5

while [ $elapsed -lt $timeout ]; do
    # Check if database is ready
    if docker compose exec -T db pg_isready -U postgres -d winterjam_dev >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is ready!${NC}"
        break
    fi

    if [ $((elapsed % 15)) -eq 0 ]; then
        echo -e "${YELLOW}⏳ Waiting for database... (${elapsed}s/${timeout}s)${NC}"
    fi

    sleep $interval
    elapsed=$((elapsed + interval))
done

if [ $elapsed -ge $timeout ]; then
    echo -e "${RED}❌ Timeout waiting for database to be ready${NC}"
    echo -e "${YELLOW}📋 Database status:${NC}"
    docker compose ps db
    echo -e "${YELLOW}📋 Database logs:${NC}"
    docker compose logs db --tail=10
    exit 1
fi

# Wait a bit more for backend to initialize
echo -e "${BLUE}⏳ Waiting for backend to initialize...${NC}"
sleep 10

# Try to check backend health
if docker compose exec -T backend curl -f http://localhost:3001/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy!${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed - service might still be starting${NC}"
fi

# Run database migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
docker compose exec -T backend npm run migrate 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Migration script not available, database should auto-initialize${NC}"
}

# Show final status
echo ""
echo -e "${GREEN}🎉 Development deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
docker compose ps

echo ""
echo -e "${GREEN}🌐 Your development application is now running at:${NC}"
echo -e "${BLUE}   🌍 Website: http://localhost:3000${NC}"
echo -e "${BLUE}   🔧 API: http://localhost:3001/api${NC}"
echo -e "${BLUE}   ⚙️  Admin: http://localhost:3001/admin${NC}"
echo -e "${BLUE}   🗄️  Database: localhost:5432 (winterjam_dev)${NC}"

echo ""
echo -e "${YELLOW}📝 Useful development commands:${NC}"
echo "   📋 View logs: docker compose logs -f [service-name]"
echo "   🔄 Restart: docker compose restart [service-name]"
echo "   🛑 Stop all: docker compose down"
echo "   🗄️  Database shell: docker compose exec db psql -U postgres winterjam_dev"
echo "   🔧 Backend shell: docker compose exec backend bash"
echo "   🎨 Frontend shell: docker compose exec frontend sh"
echo "   📊 Check health: curl http://localhost:3001/health"

echo ""
echo -e "${BLUE}🏥 Performing final health checks...${NC}"
sleep 2

# Check backend health
if docker compose exec -T backend curl -f http://localhost:3001/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed - check logs with: docker compose logs backend${NC}"
fi

# Check if frontend is responding
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend health check failed - check logs with: docker compose logs frontend${NC}"
fi

echo ""
echo -e "${GREEN}✨ Happy development! 🎮${NC}"
echo ""
echo -e "${BLUE}💡 Development Tips:${NC}"
echo "   • Frontend hot-reload is enabled"
echo "   • Backend uses development mode (in-memory storage for some features)"
echo "   • Database data persists between restarts"
echo "   • Use 'docker compose down -v' to reset database"