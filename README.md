[![Azure Deployment](https://github.com/syl3n7/ipmaia-winterjam/actions/workflows/main.yml/badge.svg)](https://github.com/syl3n7/ipmaia-winterjam/actions/workflows/main.yml)

# IPMAIA WinterJam Website

A web application for IPMAIA's WinterJam event, a 45-hour game development competition hosted by IPMAIA for game development students.

## Project Overview

This website serves as the official platform for IPMAIA's WinterJam event, providing:
- Event registration via QR code
- Detailed rules and regulations
- Event schedule and guidelines
- Contact information
- Responsive design for both mobile and desktop users

## Event Details

### Duration
- 45 hours (Friday 17:00 to Sunday 14:00)
- January 10-12

### Participation Rules
- Open to IPMAIA/ISMAI students
- External participants must team up with at least one IPMAIA/ISMAI student
- Teams of up to 4 people
- Minimum 2 team members must participate in person
- Remote participation allowed for remaining team members

### Evaluation Criteria
- Theme Compliance: 20 points
- Creativity/USP: 20 points
- Quality (Fun Factor): 20 points
- Rules Compliance: 20 points
- Visual/Aesthetic Presentation: 20 points

## Technical Stack

### Core Technologies
- Next.js
- React
- Tailwind CSS
- Flowbite React Components

### Fonts
- Geist Sans (Variable Font)
- Geist Mono (Variable Font)
- Inter (Web Font)

## Components

### Pages
- Home: Landing page with event banner and registration
- Rules: Comprehensive rulebook with downloadable PDF
- Registration: QR code-based registration system

### Core Components
- MainNavbar: Navigation component with event branding
- BannerCenter: Registration call-to-action
- Footer: Social links and copyright information
- PDFViewer: Responsive rules document viewer

## Contact

- Email: gamejam.at.ipmaia@gmail.com
- Social Media:
  - Instagram: @ipmaiaoficial
  - Facebook: djd.ipmaia
  - Website: ipmaia.pt

## Development

### Prerequisites
- Node.js
- npm/yarn

### Project Structure
```
├── components/
│   ├── banner.js
│   ├── footer.js
│   ├── navbar.js
│   └── PDFViewer.js
├── public/
│   └── images/
│       ├── IPMAIA_SiteBanner.png
│       └── QRCodeWinterJam.png
└── app/
    ├── layout.js
    └── page.js
```

---

© Copyright IPMAIA - All rights reserved
