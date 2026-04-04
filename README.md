[![Docker Build](https://github.com/syl3n7/ipmaia-winterjam/actions/workflows/docker.yml/badge.svg)](https://github.com/syl3n7/ipmaia-winterjam/actions/workflows/docker.yml)

# IPMAIA WinterJam Website 🏔️

A robust web platform for IPMAIA’s WinterJam event—a 45-hour game development competition. Features include automated database migrations, OIDC authentication, a full admin SPA, and modern DevOps.

---

## ✨ Features

- **Game Jam Management**: End-to-end event lifecycle, game submissions, and archiving
- **Admin SPA**: Single-page admin dashboard for content, events, games, users, sponsors, and system settings
- **OIDC Authentication**: Secure admin access via PocketID
- **Automated Migrations**: Health-checked, timed database setup and updates
- **Responsive Design**: Mobile-first, desktop-optimized UI
- **SEO & Performance**: Automatic sitemap, robots.txt, image URL localization, and CSP headers
- **Security**: Session management, input validation, rate limiting, and security headers
- **DevOps**: Dockerized deployment, health checks, CI/CD, and SSL automation

---

## 🚀 Quick Start

### 1. Environment Setup

```bash
cp .env.example .env
nano .env
```

### 2. Deploy with Docker

```bash
docker-compose up -d
./scripts/timed-build.sh up -d --build
docker-compose logs -f backend
```

### 3. Access

- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3001/admin
- **API**: http://localhost:3001/api

---

## 🤖 Migration System

- Health checks for DB and backend
- Timed startup delay (`STARTUP_DELAY`)
- Auto-migration when backend is healthy
- Manual migration: `npm run migrate`
- Migration logs: `docker-compose logs backend | grep -E "(⏳|🎯|✅|❌|🚀)"`

---

## 🏗️ Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ PostgreSQL  │◄──►│ Backend API │◄──►│ Frontend    │
│ Database    │    │ + Admin SPA │    │ (Next.js)   │
└─────────────┘    └─────────────┘    └─────────────┘
         │                │                │
         ▼                ▼                ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Migration   │    │ OIDC Auth   │    │ Admin Panel │
│ System      │    │ (PocketID)  │    │ (/admin)    │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## 🗂️ Project Structure

```
ipmaia-winterjam/
├── src/                # Frontend (Next.js)
│   ├── app/            # App Router pages
│   ├── components/     # UI components
│   ├── contexts/       # React contexts
│   ├── data/           # Static data
│   ├── lib/            # API helpers
│   ├── pages/          # Custom _document.js
│   └── utils/          # Utility functions
├── backend/            # Backend API (Express)
│   ├── admin/          # Admin SPA static files
│   ├── config/         # DB/auth config
│   ├── migrations/     # DB migration scripts
│   ├── models/         # ORM models
│   ├── routes/         # API endpoints
│   ├── scripts/        # Migration/utility scripts
│   └── uploads/        # File uploads
├── public/             # Static assets
├── scripts/            # Build/util scripts
├── ssl/                # SSL certificates
├── Dockerfile          # Backend Dockerfile
├── docker-compose.yml  # Main orchestration
├── docker-compose.prod.yml # Production orchestration
└── README.md           # This file
```

---

### Forms System
The admin panel includes a built-in Forms Manager for creating and managing custom forms (e.g. event registrations).

**Admin routes:**
- `/admin/forms` — list, edit, and delete forms; view submissions
- `/admin/forms/builder` — visual field builder with field types: Text, Email, Phone, Select, Radio, Checkbox, Textarea

**Public route:** `/forms/[slug]` — renders and accepts submissions for a published form

**How it works:**
1. Admin creates a form with a unique slug and configures fields in the builder
2. Published forms are accessible at `/forms/[slug]`
3. Submissions are stored in the database and viewable in the admin panel
4. On submission, a confirmation email is sent to the user and a notification to the configured admin email (requires SMTP configuration — see environment variables table)
5. Submissions can be exported as CSV from the admin panel submissions view

**Key API endpoints:**
- `POST /api/admin/forms` — create form
- `GET /api/admin/forms/:id/submissions` — list submissions
- `POST /api/forms/:slug/submit` — public submission endpoint

CSV export is currently available from the admin UI rather than as a separate documented admin API endpoint.

## 🔧 Configuration

### Environment Variables

| Variable            | Description                  | Example                        |
|---------------------|-----------------------------|--------------------------------|
| DB_NAME             | Database name               | winterjam                      |
| DB_USER             | Database user               | postgres                       |
| DB_PASSWORD         | Database password           | secure_password                |
| SESSION_SECRET      | Session encryption key      | another_random_string          |
| OIDC_ISSUER_URL     | PocketID instance URL       | https://auth.example.com       |
| OIDC_CLIENT_ID      | OIDC application ID         | winterjam_app                  |
| OIDC_CLIENT_SECRET  | OIDC application secret     | secret_from_pocketid           |
| OIDC_REDIRECT_URI   | OAuth callback URL          | https://api.example.com/api/auth/oidc/callback |
| OIDC_ADMIN_EMAIL    | Admin user email            | admin@example.com              |
| STARTUP_DELAY       | Startup delay (seconds)     | 10                             |
| NEXT_PUBLIC_API_URL | Frontend API endpoint       | https://api.example.com/api    |

---

## 🛡️ Security

- **Rate Limiting**: Higher limits for super admins, standard for others
- **Session Management**: Secure cookies, role-based access
- **Security Headers**: Helmet, CSP, X-Frame-Options, etc.
- **HTTPS Only**: SSL via Let's Encrypt or custom certs
- **Isolated Networks**: Docker private networks

---

## 🛠️ Development

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (local dev)

### Local Development

```bash
npm install
cd backend && npm install
docker-compose up db -d
cd backend && npm run dev
npm run dev
```

---

## 🚢 Production Deployment

### Docker Production Setup

- Ubuntu 22.04+ recommended
- SSL setup via `./setup-ssl.sh`
- Deploy: `./deploy-docker.sh`
- Monitor: `docker-compose -f docker-compose.prod.yml logs nginx`

---

## 📋 Recent Updates

### v3.0.0 - Production & Maintenance (December 2025)
- Maintenance Mode: Automatic maintenance page with auto-refresh during deployments
- Production Scripts: Automated deployment with `deploy-docker.sh`
- SSL Setup: Easy SSL certificate configuration with `setup-ssl.sh`
- Enhanced Security: Rate limiting, security headers, and isolated Docker networks
- Health Monitoring: Comprehensive health checks and status monitoring
- Docker Production: Full Nginx reverse proxy setup for production

### v2.5.0 - Enhanced UX & Security
- Game detail modals
- Team member display fixes
- SEO optimization
- Performance improvements
- Security enhancements
- Build monitoring
- Improved error handling

---

**🎮 Ready to host your own game jam? Fork this repository and customize it for your event!**
