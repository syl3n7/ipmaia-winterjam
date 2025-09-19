[![Docker Build](https://github.com/syl3n7/ipmaia-winterjam/actions/workflows/docker.yml/badge.svg)](https://github.com/syl3n7/ipmaia-winterjam/actions/workflows/docker.yml)

# IPMAIA WinterJam Website 🏔️

A web application for IPMAIA's WinterJam event, a 45-hour game development competition hosted by IPMAIA for game development students.

## 🚀 Quick Deploy with Docker

### Method 1: Portainer Stack (Recommended for your setup)
1. Go to **https://portainer.steelchunk.eu/**
2. Navigate to **Stacks** → **Add Stack**
3. Name it `ipmaia-winterjam`
4. Copy the contents of `portainer-stack.yml` into the editor
5. Deploy the stack
6. Access at **http://192.168.1.69:3000**

📖 **[Detailed Portainer Guide](PORTAINER.md)**

### Method 2: Using the deployment script
```bash
./deploy.sh
```

### Method 3: Manual Docker commands
```bash
# Pull the latest image
docker pull ghcr.io/syl3n7/ipmaia-winterjam:latest

# Run the container
docker run -d \
  --name ipmaia-winterjam \
  -p 3000:3000 \
  --restart unless-stopped \
  ghcr.io/syl3n7/ipmaia-winterjam:latest
```

### Method 4: Using Docker Compose
```bash
docker-compose up -d
```

### 🔄 Auto-updates with Watchtower
To automatically update your container when new versions are pushed:
```bash
docker run -d \
  --name watchtower \
  --restart unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e WATCHTOWER_CLEANUP=true \
  -e WATCHTOWER_POLL_INTERVAL=300 \
  containrrr/watchtower
```

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