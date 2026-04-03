[![Docker Build](https://github.com/syl3n7/ipmaia-winterjam/actions/workflows/docker.yml/badge.svg)](https://github.com/syl3n7/ipmaia-winterjam/actions/workflows/docker.yml)

# IPMAIA WinterJam Website 🏔️

A comprehensive web application for IPMAIA's WinterJam event - a 45-hour game development competition featuring automated database migrations, local admin authentication, and a complete admin management system.

## ✨ Features

- **🎮 Event Management**: Complete game jam lifecycle management
- **👤 Authentication**: Local admin authentication (DB-backed). External OIDC/PocketID support is deprecated/disabled by default.
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

### Security notes & Argon2
- Install Argon2 in the backend for strong password hashing:

```bash
cd backend
npm install argon2
```

- To enable the legacy dev auto-login behavior during local testing, set `ALLOW_DEV_AUTOLOGIN=true` in your `.env` (disabled by default).
- Recommended Argon2 / bcrypt environment variables are included in `.env.example` (ARGON2_* and BCRYPT_SALT_ROUNDS).

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
│ Auto-Migration  │    │ Auth (Local)    │    │ Admin Panel     │
│ System          │    │ (DB / JWT)      │    │ (/admin)        │
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
- Local authentication (DB-backed sessions + JWT)
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

### Forms System
The admin panel includes a built-in Forms Manager for creating and managing custom forms (e.g. event registrations).

**Admin routes:**
- `/admin/forms` — list, edit, and delete forms; view submissions
- `/admin/forms/builder` — visual field builder with field types: Text, Email, Phone, Select, Radio, Checkbox, Textarea

**Public route:** `/form/[slug]` — renders and accepts submissions for a published form

**How it works:**
1. Admin creates a form with a unique slug and configures fields in the builder
2. Published forms are accessible at `/form/[slug]`
3. Submissions are stored in the database and viewable in the admin panel
4. On submission, a confirmation email is sent to the user and a notification to the configured admin email (requires SMTP configuration — see environment variables table)
5. Submissions can be exported as CSV from the admin panel

**Key API endpoints:**
- `POST /api/admin/forms` — create form
- `GET /api/admin/forms/:id/submissions` — list submissions
- `GET /api/admin/forms/:id/export` — export submissions as CSV
- `POST /api/forms/:slug/submit` — public submission endpoint

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_NAME` | Database name | `winterjam` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `your_secure_password` |
| `JWT_SECRET` | JWT signing key | `your_jwt_secret_here` |
| `SESSION_SECRET` | Session encryption key | `your_session_secret_here` |
| `DEV_BYPASS_CSRF` | Optional dev helper — when true (or when `NODE_ENV !== 'production'`), the server will skip CSRF checks for admin endpoints to simplify local development. In production, ensure `NODE_ENV=production` to enforce CSRF. | `true` |
| `SMTP_HOST` | SMTP server hostname | `smtp.your-provider.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username / login | `your_smtp_user` |
| `SMTP_PASS` | SMTP password | `your_smtp_password` |
| `SMTP_SECURE` | Use TLS (true/false) | `false` |
| `FROM_EMAIL` | Sender address for outgoing emails | `no-reply@ipmaia-winterjam.pt` |
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
- Local admin authentication
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
├── docker-compose.local.yml  # Local development compose
├── docker-compose.prod.yml   # Production compose
├── docker-compose.db.yml     # Database-only compose
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

# External OIDC / PocketID (optional - deprecated)
# External OIDC / PocketID integration is disabled by default in this codebase.
# To re-enable, restore the provider client and set the following environment variables (optional):
# OIDC_ISSUER_URL, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_REDIRECT_URI, OIDC_ADMIN_EMAIL
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
- **CSRF Protection**: Admin endpoints require a valid CSRF token for state-changing requests when running in production. The frontend fetches the token from `GET /api/auth/csrf-token` (response `{ csrfToken }` and a readable `XSRF-TOKEN` cookie) and must include it as the `csrf-token` header for POST/PUT/DELETE requests. For development the server skips CSRF checks for admin routes when `NODE_ENV !== 'production'` to simplify local testing; this behavior can be tightened in dev by setting `NODE_ENV=production` or adjusting server configuration.

#### Example (fetch token + send request)

```javascript
// Fetch CSRF token (usually done after login / on app init)
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/csrf-token`, { credentials: 'include' });
if (res.ok) {
  const { csrfToken } = await res.json();
  // Store token in memory (never in localStorage); our AdminAuthContext stores it in context
}

// Use token for state-changing request
await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/games`, {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'csrf-token': csrfToken  // required in production
  },
  body: JSON.stringify({ title: 'New Game' })
});
```

> Tip: The project provides `apiFetch` via `AdminAuthContext` which automatically adds the CSRF token header for non-GET requests when available.

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