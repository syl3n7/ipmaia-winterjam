#!/bin/bash

# Pre-deployment preparation script
echo "🔧 Preparing IPMAIA WinterJam for production deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Check if example env file exists and create production env
if [ ! -f .env.production ]; then
    if [ -f .env.production.example ]; then
        echo -e "${BLUE}📋 Creating .env.production from example...${NC}"
        cp .env.production.example .env.production
        echo -e "${YELLOW}⚠️  IMPORTANT: Please edit .env.production and fill in your production values!${NC}"
        echo -e "${BLUE}Required values to change:${NC}"
        echo "   - DB_PASSWORD (strong database password)"
        echo "   - JWT_SECRET (256+ bit random string)"
        echo "   - SESSION_SECRET (256+ bit random string)"
        echo "   - OIDC_ISSUER_URL (your OIDC provider URL)"
        echo "   - OIDC_CLIENT_ID (your OIDC client ID)"
        echo "   - OIDC_CLIENT_SECRET (your OIDC client secret)"
        echo "   - OIDC_ADMIN_EMAIL (email that gets admin privileges)"
        echo "   - FRONTEND_URL (your domain)"
        echo "   - NEXT_PUBLIC_API_URL (your domain/api)"
        echo ""
        read -p "Press Enter after you've edited .env.production..."
    else
        echo -e "${RED}❌ .env.production.example not found${NC}"
        exit 1
    fi
fi

# Step 2: Validate environment file
echo -e "${BLUE}🔍 Validating environment configuration...${NC}"

required_vars=("DB_PASSWORD" "JWT_SECRET" "SESSION_SECRET" "OIDC_ISSUER_URL" "OIDC_CLIENT_ID" "OIDC_CLIENT_SECRET" "OIDC_ADMIN_EMAIL"}
missing_vars=()

while IFS= read -r line; do
    if [[ $line =~ ^([^#][^=]+)=(.*)$ ]]; then
        var_name="${BASH_REMATCH[1]}"
        var_value="${BASH_REMATCH[2]}"
        
        # Check if this is a required variable and if it's empty or contains placeholder text
        for required_var in "${required_vars[@]}"; do
            if [[ "$var_name" == "$required_var" ]]; then
                if [[ -z "$var_value" ]] || [[ "$var_value" == *"your_"* ]] || [[ "$var_value" == *"_here"* ]]; then
                    missing_vars+=("$var_name")
                fi
            fi
        done
    fi
done < .env.production

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing or invalid values for required variables:${NC}"
    printf '%s\n' "${missing_vars[@]}"
    echo -e "${YELLOW}Please edit .env.production and set proper values${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment configuration looks good${NC}"

# Step 3: Generate strong secrets if needed (helper)
echo -e "${BLUE}💡 Secret generation helper:${NC}"
echo "   JWT_SECRET: $(openssl rand -base64 64 | tr -d '\n')"
echo "   SESSION_SECRET: $(openssl rand -base64 64 | tr -d '\n')"
echo ""

# Step 4: Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is ready${NC}"

# Step 5: Check for SSL certificates (optional)
if [ -d "ssl" ] && [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
    echo -e "${GREEN}✅ SSL certificates found${NC}"
else
    echo -e "${YELLOW}⚠️  No SSL certificates found${NC}"
    echo -e "${BLUE}For production, consider setting up SSL:${NC}"
    echo "   1. Get certificates from Let's Encrypt, your hosting provider, or CA"
    echo "   2. Place cert.pem and key.pem in the ssl/ directory"
    echo "   3. Update nginx.conf to enable HTTPS"
fi

# Step 6: Create backup directory
echo -e "${BLUE}📁 Creating backup directory...${NC}"
mkdir -p backups

# Step 7: Final checks
echo -e "${BLUE}🔍 Final pre-flight checks...${NC}"

# Check if ports are available
if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 80 is in use${NC}"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3000 is in use${NC}"
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3001 is in use${NC}"
fi

# Make deploy script executable
chmod +x deploy-prod.sh

echo ""
echo -e "${GREEN}🎉 Pre-deployment preparation completed!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "   1. Review your .env.production file"
echo "   2. Run: ./deploy-prod.sh"
echo "   3. Configure your domain DNS to point to this server"
echo "   4. Set up SSL certificates (recommended for production)"
echo ""
echo -e "${GREEN}Ready to deploy! 🚀${NC}"