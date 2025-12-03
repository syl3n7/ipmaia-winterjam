[![Docker Build](https://github.com/syl3n7/ipmaia-winterjam/actions/workflows/docker.yml/badge.svg)](https://github.com/syl3n7/ipmaia-winterjam/actions/workflows/docker.yml)

# IPMAIA WinterJam Website 🏔️

A comprehensive web application for IPMAIA's WinterJam event - a 45-hour game development competition featuring automated database migrations, OIDC authentication, and a complete admin management system.

## ✨ Features

- **🎮 Event Management**: Complete game jam lifecycle management
- **👤 OIDC Authentication**: Secure admin access via PocketID
- **📊 Admin Dashboard**: Full control over front page content, events, and games
- **🤖 Auto-Migration**: Automated database setup and updates with timing metrics
- **📱 Responsive Design**: Mobile and desktop optimized with modal game details
- **🔄 Real-time Status**: Dynamic event status detection
- **🎯 Game Archive**: Browse and showcase submitted games with detailed modals
- **🛡️ Security**: Proper session handling, input validation, and CSP protection
- **🔍 SEO Optimized**: Automatic sitemap generation with next-sitemap
- **⚡ Performance**: Image URL localization and optimized loading
- **🚧 Maintenance Mode**: Automatic maintenance page during deployments with auto-refresh

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env
```

### 2. Deploy with Docker (Recommended)
```bash
# Start everything with automated migration
docker compose up -d

# Check logs to see auto-migration in action
docker compose logs -f backend
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3001/admin
- **API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

## 🤖 Automated Migration System

The application includes an intelligent migration system that:

1. **Database starts** with health checks
2. **Backend starts** and waits for database initialization
3. **Startup delay** allows backend to fully initialize (configurable via `STARTUP_DELAY`)
4. **Health checks** verify backend is responding
5. **Auto-migration runs** when backend is healthy
6. **Frontend starts** when backend is ready
7. **All services connected** via internal network

### Migration Scripts
```bash
# Check backend health
npm run health

# Run migrations manually
npm run migrate

# Auto-migration with health check
npm run migrate:auto
```

### Migration Logs
```bash
# View migration progress
docker compose logs backend | grep -E "(⏳|🎯|✅|❌|🚀)"

# Example output:
# ⏳ Giving backend 10 seconds to initialize...
# ⏳ Now checking if backend is healthy and running migrations...
# 🎯 Auto-migration starting...
# ⚙️  Max retries: 30, Interval: 2000ms
# ⏳ Attempt 1/30 - Backend not ready yet (58s remaining)...
# ✅ Backend is healthy!
# 🚀 Starting database migration...
# ✅ Migration completed successfully!
```

## 🏗️ Architecture

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │◄──►│   Backend API   │◄──►│   Frontend      │
│   Database      │    │   + Admin       │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Auto-Migration  │    │ OIDC Auth       │    │ Admin Panel     │
│ System          │    │ (PocketID)      │    │ (/admin)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Tech Stack

**Frontend:**
- Next.js 15 (React 18)
- Tailwind CSS + Flowbite
- Responsive design
- API integration
- Automatic sitemap generation
- Image URL localization for performance

**Backend:**
- Node.js + Express
- PostgreSQL database
- OIDC authentication
- Session management
- File uploads (Multer)

**DevOps:**
- Docker + Docker Compose
- Automated migrations with timing metrics
- Health checks and startup monitoring
- CI/CD ready with GitHub Actions
- Automatic sitemap generation (next-sitemap)

## 📊 Database Schema

### Core Tables
- **users**: Admin authentication
- **game_jams**: Event management
- **games**: Submitted games
- **front_page_settings**: Admin-controlled content

### Admin Features
- **Front Page Control**: Edit hero content, buttons, visibility settings
- **Event Management**: Create/edit game jams, set dates and themes
- **Game Management**: Feature games, manage submissions
- **User Management**: Admin access control

### Game Archive Features
- **Interactive Game Cards**: Click to open detailed modal views
- **Team Member Display**: Proper name formatting from database objects
- **Ranking System**: Visual badges for top 3 placements
- **Direct Links**: Quick access to itch.io pages and GitHub repositories
- **Tag System**: Categorized games with theme and ranking tags

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_NAME` | Database name | `winterjam` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `your_secure_password` |
| `JWT_SECRET` | JWT signing key | `your_jwt_secret_here` |
| `SESSION_SECRET` | Session encryption key | `your_session_secret_here` |
| `OIDC_ISSUER_URL` | PocketID instance URL | `https://your-auth-server.com` |
| `OIDC_CLIENT_ID` | OIDC application ID | `your_client_id` |
| `OIDC_CLIENT_SECRET` | OIDC application secret | `your_client_secret` |
| `OIDC_REDIRECT_URI` | OAuth callback URL | `https://your-domain.com/api/auth/oidc/callback` |
| `OIDC_ADMIN_EMAIL` | Admin user email | `admin@yourdomain.com` |
| `POCKETID_API_URL` | PocketID API endpoint (optional) | `https://your-auth-server.com/api` |
| `POCKETID_API_KEY` | PocketID API key (optional) | `your_api_key` |
| `STARTUP_DELAY` | Docker startup delay (seconds) | `10` (optional, default: 10) |
| `NEXT_PUBLIC_API_URL` | Frontend API endpoint | `https://your-domain.com/api` |

### Docker Services

**Database (PostgreSQL 17)**
- Health checks with `pg_isready`
- Persistent data volume
- Network isolation

**Backend (Node.js)**
- Auto-migration on startup
- Health check endpoint `/health`
- OIDC authentication
- Admin panel at `/admin`

**Frontend (Next.js)**
- Static file serving
- API proxy configuration
- Responsive design
- Automatic sitemap generation
- Image URL localization for performance

## 🔍 SEO & Sitemap

The application includes automatic SEO optimization:

### Sitemap Generation
- **next-sitemap** integration for automatic XML sitemap creation
- Single sitemap file generation (configurable size limits)
- Automatic robots.txt generation with custom rules
- Includes all static and dynamic routes

### Configuration
```javascript
// next-sitemap.config.js
module.exports = {
  siteUrl: 'https://ipmaia-winterjam.pt',
  generateRobotsTxt: true,
  sitemapSize: 5000, // Single file for all URLs
  robotsTxtOptions: {
    additionalSitemaps: ['https://ipmaia-winterjam.pt/sitemap.xml'],
    additionalRobotsTxt: `...custom rules...`
  }
}
```

### Performance Optimizations
- **Image URL Localization**: Automatically converts domain-relative URLs to local paths
- **CSP Headers**: Proper Content Security Policy with Cloudflare support
- **Responsive Images**: Optimized loading with fallbacks

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (for local development)

### Local Development
```bash
# Install dependencies
npm install
cd backend && npm install

# Start database
docker-compose up db -d

# Start backend
cd backend && npm run dev

# Start frontend
npm run dev
```

### Project Structure
```
ipmaia-winterjam/
├── src/                    # Frontend source
│   ├── app/               # Next.js pages (App Router)
│   ├── components/        # Reusable UI components
│   └── utils/             # API utilities and helpers
├── backend/               # Backend API
│   ├── routes/           # API endpoints
│   ├── scripts/          # Migration and utility scripts
│   ├── admin/            # Admin panel static files
│   └── config/           # Database and auth configuration
├── public/               # Static assets
├── scripts/              # Build and utility scripts
│   ├── timed-build.sh    # Docker build timing script
│   └── timing-aliases.sh # Helper aliases
├── next-sitemap.config.js # Sitemap configuration
├── docker-compose.yml    # Container orchestration
└── README.md            # This file
```

## 🚢 Production Deployment

### Docker Production Setup (Recommended)

This setup runs everything in Docker containers, including Nginx as a reverse proxy, so only ports 80 and 443 are exposed on your host.

#### Prerequisites
- Ubuntu 22.04 LTS or similar Linux distribution
- Docker and Docker Compose installed
- Git for cloning the repository

#### Quick Docker Deployment
```bash
# 1. Clone repository
git clone https://github.com/syl3n7/ipmaia-winterjam.git
cd ipmaia-winterjam

# 2. Configure environment
cp .env.production.example .env.production
nano .env.production  # Edit with your production values

# 3. Set up SSL certificates
./setup-ssl.sh  # Choose option 1 for Let's Encrypt

# 4. Deploy with Docker
./deploy-docker.sh

# 5. Verify deployment
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs nginx
```

#### Domain Configuration
Point both domains to your server's IP address:
- `ipmaia-winterjam.pt` → Your_Server_IP
- `api.ipmaia-winterjam.pt` → Your_Server_IP

#### SSL Certificate Options

**Option 1: Let's Encrypt (Recommended)**
```bash
./setup-ssl.sh
# Choose option 1 - automatic SSL with Let's Encrypt
```

**Option 2: Existing Certificates**
```bash
./setup-ssl.sh
# Choose option 2, then place certificates in ssl/ directory:
# - ssl/fullchain.pem (certificate chain)
# - ssl/privkey.pem (private key)
```

**Option 3: Self-Signed (Development Only)**
```bash
./setup-ssl.sh
# Choose option 3 for testing purposes
```

### Docker Services Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │◄──►│   Backend API   │◄──►│   Frontend      │
│   Database      │    │   (Port 3001)   │    │   (Port 3000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │   Nginx Proxy   │
                    │ (Ports 80,443)  │
                    └─────────────────┘
```

### Environment Configuration

Create `.env.production` with your production values:

```bash
# Database
DB_NAME=winterjam
DB_USER=postgres
DB_PASSWORD=your-secure-db-password

# Security (Generate strong random strings)
JWT_SECRET=your-256-bit-jwt-secret
SESSION_SECRET=your-256-bit-session-secret

# URLs
FRONTEND_URL=https://ipmaia-winterjam.pt
NEXT_PUBLIC_API_URL=https://api.ipmaia-winterjam.pt/api

# OIDC (PocketID)
OIDC_ISSUER_URL=https://your-pocketid-domain.com
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_REDIRECT_URI=https://api.ipmaia-winterjam.pt/api/auth/oidc/callback
OIDC_ADMIN_EMAIL=admin@ipmaia-winterjam.pt
```

### SSL Certificate Renewal

**Let's Encrypt certificates auto-renew** via cron job (set up automatically).

**Manual renewal:**
```bash
# Stop nginx temporarily
docker-compose -f docker-compose.prod.yml down nginx

# Renew certificates
sudo certbot renew

# Copy renewed certificates
sudo cp /etc/letsencrypt/live/ipmaia-winterjam.pt/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/ipmaia-winterjam.pt/privkey.pem ssl/
sudo chown $(whoami):$(whoami) ssl/*.pem

# Restart nginx
docker-compose -f docker-compose.prod.yml up -d nginx
```

### Monitoring & Maintenance

```bash
# Check service health
docker-compose -f docker-compose.prod.yml exec backend curl -f http://localhost:3001/health

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Database backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres winterjam > backup_$(date +%Y%m%d).sql

# Update deployment
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build

# Restart specific service
docker-compose -f docker-compose.prod.yml restart frontend

# Check resource usage
docker stats
```

### Security Features

- **Rate Limiting**: Different limits for frontend (30r/s), API (10r/s), and admin (5r/s)
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **HTTPS Only**: HTTP automatically redirects to HTTPS
- **Isolated Networks**: Docker containers communicate via private networks
- **Minimal Exposed Ports**: Only 80 and 443 exposed on host

### 🚧 Maintenance Mode

Automatic maintenance page system for zero-downtime deployments:

```bash
# Automatic during deployment - no action needed
./deploy-docker.sh

# Manual control (if needed)
./maintenance-on.sh   # Enable maintenance mode
./maintenance-off.sh  # Disable maintenance mode
```

**Features:**
- 🎨 Branded maintenance page with auto-refresh
- ⏱️ Checks service status every 10 seconds
- 🔄 Automatically redirects when services are back
- 📱 Mobile and desktop responsive

See [MAINTENANCE.md](MAINTENANCE.md) for full documentation.

---

**🎮 Ready to host your own game jam? Fork this repository and customize it for your event!**

## 📋 Recent Updates

### v3.0.0 - Production & Maintenance (December 2025)
- ✅ **Maintenance Mode**: Automatic maintenance page with auto-refresh during deployments
- ✅ **Production Scripts**: Automated deployment with `deploy-docker.sh`
- ✅ **SSL Setup**: Easy SSL certificate configuration with `setup-ssl.sh`
- ✅ **Enhanced Security**: Rate limiting, security headers, and isolated Docker networks
- ✅ **Health Monitoring**: Comprehensive health checks and status monitoring
- ✅ **Docker Production**: Full Nginx reverse proxy setup for production

### v2.5.0 - Enhanced User Experience
- ✅ **Game Detail Modals**: Click any game card to view full details in a modal
- ✅ **Team Member Display**: Fixed "[object Object]" issue - names now display correctly
- ✅ **SEO Optimization**: Automatic sitemap generation with next-sitemap
- ✅ **Performance Improvements**: Image URL localization for faster loading
- ✅ **Security Enhancements**: Updated CSP to allow Cloudflare Insights

### v2.0.0 - Production Ready
- ✅ **Automated Migration**: Docker startup with intelligent health checks
- ✅ **OIDC Authentication**: Secure admin access via PocketID
- ✅ **Admin Dashboard**: Complete front page content management
- ✅ **Responsive Design**: Mobile and desktop optimized