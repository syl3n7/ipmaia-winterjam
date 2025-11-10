#!/bin/bash

# IPMAIA WinterJam - SSL Certificate Setup Script
# This script helps set up SSL certificates for Docker deployment

set -e

echo "🔒 Setting up SSL certificates for IPMAIA WinterJam..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Create SSL directory
mkdir -p ssl

echo -e "${BLUE}📝 SSL Certificate Options:${NC}"
echo "1. Use Let's Encrypt (automatic)"
echo "2. Use existing certificates"
echo "3. Generate self-signed certificates (development only)"
echo ""

read -p "Choose an option (1-3): " choice

case $choice in
    1)
        echo -e "${BLUE}🔒 Setting up Let's Encrypt certificates...${NC}"

        # Check if certbot is installed
        if ! command -v certbot &> /dev/null; then
            echo -e "${YELLOW}📦 Installing certbot...${NC}"
            sudo apt update
            sudo apt install -y certbot
        fi

        # Stop nginx if running
        echo -e "${BLUE}🛑 Stopping nginx temporarily...${NC}"
        docker-compose -f docker-compose.prod.yml down nginx 2>/dev/null || true

        # Get certificates
        echo -e "${BLUE}📜 Obtaining certificates for ipmaia-winterjam.pt and api.ipmaia-winterjam.pt...${NC}"
        sudo certbot certonly --standalone -d ipmaia-winterjam.pt -d api.ipmaia-winterjam.pt

        # Copy certificates to ssl directory
        echo -e "${BLUE}📁 Copying certificates to ssl directory...${NC}"
        sudo cp /etc/letsencrypt/live/ipmaia-winterjam.pt/fullchain.pem ssl/
        sudo cp /etc/letsencrypt/live/ipmaia-winterjam.pt/privkey.pem ssl/

        # Set proper permissions
        sudo chown $(whoami):$(whoami) ssl/*.pem
        chmod 600 ssl/privkey.pem
        chmod 644 ssl/fullchain.pem

        # Setup auto-renewal
        echo -e "${BLUE}🔄 Setting up certificate renewal...${NC}"
        (crontab -l ; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload") | crontab -

        echo -e "${GREEN}✅ Let's Encrypt certificates configured!${NC}"
        ;;

    2)
        echo -e "${BLUE}📁 Using existing certificates...${NC}"
        echo "Please ensure you have placed your certificates in the ssl/ directory:"
        echo "  - ssl/fullchain.pem (certificate chain)"
        echo "  - ssl/privkey.pem (private key)"
        echo ""
        read -p "Have you placed the certificates? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if [ -f ssl/fullchain.pem ] && [ -f ssl/privkey.pem ]; then
                echo -e "${GREEN}✅ Certificates found!${NC}"
            else
                echo -e "${RED}❌ Certificates not found in ssl/ directory${NC}"
                exit 1
            fi
        else
            echo -e "${YELLOW}🛑 Certificate setup cancelled${NC}"
            exit 1
        fi
        ;;

    3)
        echo -e "${YELLOW}🛠️  Generating self-signed certificates (development only)...${NC}"

        # Generate self-signed certificate
        openssl req -x509 -newkey rsa:4096 -keyout ssl/privkey.pem -out ssl/fullchain.pem -days 365 -nodes \
            -subj "/C=PT/ST=Portugal/L=Porto/O=IPMAIA/CN=ipmaia-winterjam.pt" \
            -addext "subjectAltName=DNS:ipmaia-winterjam.pt,DNS:api.ipmaia-winterjam.pt"

        chmod 600 ssl/privkey.pem
        chmod 644 ssl/fullchain.pem

        echo -e "${GREEN}✅ Self-signed certificates generated!${NC}"
        echo -e "${YELLOW}⚠️  Note: Self-signed certificates will show security warnings in browsers${NC}"
        ;;

    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 SSL setup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Run deployment: ./deploy-docker.sh"
echo "2. Your site will be available at https://ipmaia-winterjam.pt"
echo "3. API will be available at https://api.ipmaia-winterjam.pt"
echo ""
echo -e "${YELLOW}🔄 Certificate renewal:${NC}"
echo "  Let's Encrypt certificates auto-renew via cron job"
echo "  Self-signed certificates expire after 365 days"