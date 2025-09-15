[![HomeLab Deployment](https://github.com/syl3n7/ipmaia-winterjam/actions/workflows/main.yml/badge.svg)](https://github.com/syl3n7/ipmaia-winterjam/actions/workflows/main.yml)

# IPMAIA WinterJam Website

A web application for IPMAIA's WinterJam event, a 45-hour game development competition hosted by IPMAIA for game development students.

## Project Overview

This website serves as the official platform for IPMAIA's WinterJam event, providing:
- Event registration via Microsoft Forms
- Game archive with all submitted games
- Detailed rules and regulations
- Event schedule and guidelines
- Contact information
- Responsive design for both mobile and desktop users

## Event Details

### Duration
- 45 hours (Friday 17:00 to Sunday 14:00)
- February 14-16, 2025

### Participation Rules
- Open to IPMAIA/UMAIA students and alumni
- Teams of up to 4 people
- Online/in-person hybrid format coordinated through Discord
- In-person participation available upon request

### Evaluation Criteria
- Theme Compliance: 20 points
- Creativity/USP: 20 points
- Quality (Fun Factor): 20 points
- Rules Compliance: 20 points
- Visual/Aesthetic Presentation: 20 points

## Technical Stack

### Core Technologies
- Next.js 15
- React 18
- Tailwind CSS
- Flowbite React Components

### Fonts
- Geist Sans (Variable Font)
- Geist Mono (Variable Font)
- Inter (Web Font)

## Components and Pages

### Pages
- Home: Landing page with event banner and dynamic registration/status
- Archive: Browse all past game jams and submitted games
- Rules: Comprehensive rulebook with downloadable PDF
- Registration: Microsoft Forms integration

### Core Components
- MainNavbar: Navigation component with event branding
- Background: Dynamic background image with error handling
- GameModal: Interactive game details viewer
- Footer: Social links and copyright information

## Game Archive Features

- Browse all submitted games
- Filter by winners and other submissions
- View detailed game information including:
  - Game descriptions and instructions
  - Screenshots and gameplay details
  - Team information and member roles
  - Direct links to play the games

## Event Status Features

- Real-time event status detection
- Offline-capable with cached status information 
- Dynamic UI based on event phase (upcoming, ongoing, completed)

## Contact

- Email: gamejam.at.ipmaia@gmail.com
- Social Media:
  - Instagram: @ipmaiaoficial
  - Facebook: @ipmaiaoficial
  - Website: https://ipmaia.pt

## Security

This application enforces modern security standards and only accepts HTTP/2 or HTTP/3 connections for enhanced security.

### Security Features

- **HTTP/2+ Only**: Rejects HTTP/1.0 and HTTP/1.1 connections
- **HTTPS Enforcement**: Automatic redirection to HTTPS
- **Security Headers**: Comprehensive security headers including:
  - Strict Transport Security (HSTS)
  - Content Security Policy (CSP)
  - X-Frame-Options
  - X-Content-Type-Options
  - X-XSS-Protection
  - Referrer Policy
  - Permissions Policy

### Server Configuration

#### For Nginx
Add to your server block:
```nginx
# Only allow HTTP/2 and HTTP/3
if ($http2 = "") {
    return 426 "HTTP/2 or HTTP/3 required";
}

# Enable HTTP/2
listen 443 ssl http2;

# Enable HTTP/3 (if supported)
listen 443 quic reuseport;
add_header Alt-Svc 'h3=":443"; ma=86400, h2=":443"; ma=86400';

# Security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

#### For Apache (.htaccess)
```apache
RewriteEngine On
RewriteCond %{HTTP:HTTP2-Settings} ^$
RewriteCond %{HTTPS} on
RewriteRule .* - [R=426,L]

Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set Alt-Svc 'h3=":443"; ma=86400, h2=":443"; ma=86400'
```

#### For Cloudflare
1. Enable HTTP/2 and HTTP/3 in the Network tab
2. Create a Worker or Page Rule to block HTTP/1.x requests
3. Enable HSTS in the Edge Certificates section
4. The included Cloudflare Worker automatically enforces these security measures

### Environment Variables for Production
```bash
FORCE_HTTP2=true
DISABLE_HTTP1=true
SECURITY_HEADERS=true
```

### Security Testing
To verify HTTP/2+ enforcement:
```bash
# Should work (HTTP/2)
curl -I --http2 https://your-domain.com

# Should return 426 Upgrade Required (HTTP/1.1)
curl -I --http1.1 https://your-domain.com
```

## Development

### Prerequisites
- Node.js 18+
- npm/yarn

### Project Structure

The project follows a standard Next.js App Router structure:

- src/
  - app/ - Next.js pages using the App Router
  - components/ - Reusable UI components
  - data/ - Data models and API
  - fonts/ - Custom font files

Main application routes:
- / - Homepage with event status
- /rules - Event rules and guidelines
- /enlist-now - Registration page
- /archive/[year]/[season] - Game jam archives by year and season
- /archive/[year]/[season]/games - Full game lists for each jam

### Building and Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Deployment Notes

This application includes:
- **Next.js Middleware**: Automatically enforces HTTP/2+ and adds security headers
- **Cloudflare Worker**: Pre-configured for Cloudflare Pages deployment with security enforcement
- **Static Export**: Compatible with any static hosting service that supports HTTP/2+

**Important**: Ensure your hosting provider or CDN supports HTTP/2 and HTTP/3 for optimal security and performance.

### Security Middleware

The application includes built-in middleware that:
- Blocks HTTP/1.x requests with 426 Upgrade Required response
- Adds comprehensive security headers to all responses
- Provides detailed error messages for unsupported protocols
- Includes Alternative Service headers for HTTP/3 discovery

```