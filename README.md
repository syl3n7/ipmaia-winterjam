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
docker-compose up -d

# OR use the timed build script for detailed build timing
./scripts/timed-build.sh up -d --build

# Check logs to see auto-migration and timing in action
docker-compose logs -f backend
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3001/admin
- **API**: http://localhost:3001/api

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
docker-compose logs backend | grep -E "(⏳|🎯|✅|❌|🚀)"

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
| `DB_PASSWORD` | Database password | `secure_password` |
| `JWT_SECRET` | JWT signing key | `long_random_string` |
| `SESSION_SECRET` | Session encryption key | `another_random_string` |
| `OIDC_ISSUER_URL` | PocketID instance URL | `https://auth.example.com` |
| `OIDC_CLIENT_ID` | OIDC application ID | `winterjam_app` |
| `OIDC_CLIENT_SECRET` | OIDC application secret | `secret_from_pocketid` |
| `OIDC_REDIRECT_URI` | OAuth callback URL | `https://api.example.com/api/auth/oidc/callback` |
| `OIDC_ADMIN_EMAIL` | Admin user email | `admin@example.com` |
| `STARTUP_DELAY` | Docker startup delay (seconds) | `10` (optional, default: 10) |
| `NEXT_PUBLIC_API_URL` | Frontend API endpoint | `https://api.example.com/api` |

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

### Quick Production Setup
```bash
# 1. Clone repository
git clone https://github.com/syl3n7/ipmaia-winterjam.git
cd ipmaia-winterjam

# 2. Configure environment
cp .env.example .env
nano .env  # Edit with your production values

# 3. Deploy with auto-migration
docker-compose up -d

# 4. Verify deployment
docker-compose ps
docker-compose logs backend | grep "Migration completed"
```

### SSL Configuration (Production)
For HTTPS setup with reverse proxy (Nginx/Traefik/Zoraxy):

```bash
# Update environment for HTTPS
FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
OIDC_REDIRECT_URI=https://api.your-domain.com/api/auth/oidc/callback
```

### Monitoring & Maintenance
```bash
# Check service health
docker-compose exec backend npm run health

# View logs
docker-compose logs -f

# Database backup
docker-compose exec db pg_dump -U postgres winterjam > backup.sql

# Manual migration (if needed)
docker-compose exec backend npm run migrate
```

## 🔍 Troubleshooting

### Common Issues

**Backend won't start:**
- Check database connection in logs
- Verify environment variables
- Ensure database is healthy: `docker-compose ps`

**Migration fails:**
- Check database connectivity
- Run manual migration: `docker-compose exec backend npm run migrate`
- Review migration logs for specific errors

**OIDC authentication issues:**
- Verify OIDC configuration in `.env`
- Check PocketID application settings
- Ensure redirect URI matches exactly
- Review proxy headers if using reverse proxy

**Frontend can't connect to API:**
- Verify `NEXT_PUBLIC_API_URL` in `.env`
- Check backend health: `curl http://localhost:3001/health`
- Ensure services are on same Docker network

**Game modals not opening:**
- Check browser console for JavaScript errors
- Verify game data is loading properly
- Ensure modal state is updating correctly

**Team members showing as "[object Object]":**
- This was fixed in recent updates - team members now display properly
- If issue persists, check database migration status

**CSP blocking resources:**
- Cloudflare Insights and other external scripts are now allowed
- Check browser console for CSP violation messages
- Update CSP directives in `backend/server.js` if needed

**Sitemap not generating:**
- Run `npm run build` to trigger next-sitemap
- Check `next-sitemap.config.js` configuration
- Verify `public/sitemap.xml` and `public/robots.txt` exist

## 📞 Contact & Support

- **Event Email**: gamejam.at.ipmaia@gmail.com
- **IPMAIA Social**:
  - Instagram: @ipmaiaoficial  
  - Facebook: @ipmaiaoficial
  - Website: https://ipmaia.pt
- **Technical Issues**: Create an issue on GitHub

## 📄 License

This project is developed for IPMAIA's educational purposes. See the repository for specific licensing terms.

---

**🎮 Ready to host your own game jam? Fork this repository and customize it for your event!**

## 📋 Recent Updates

### v2.5.0 - Enhanced User Experience
- ✅ **Game Detail Modals**: Click any game card to view full details in a modal
- ✅ **Team Member Display**: Fixed "[object Object]" issue - names now display correctly
- ✅ **SEO Optimization**: Automatic sitemap generation with next-sitemap
- ✅ **Performance Improvements**: Image URL localization for faster loading
- ✅ **Security Enhancements**: Updated CSP to allow Cloudflare Insights
- ✅ **Build Monitoring**: Added timing metrics for Docker startup and builds
- ✅ **Error Handling**: Improved error messages and debugging information

### v2.0.0 - Production Ready
- ✅ **Automated Migration**: Docker startup with intelligent health checks
- ✅ **OIDC Authentication**: Secure admin access via PocketID
- ✅ **Admin Dashboard**: Complete front page content management
- ✅ **Responsive Design**: Mobile and desktop optimized
- ✅ **Real-time Status**: Dynamic event status detection