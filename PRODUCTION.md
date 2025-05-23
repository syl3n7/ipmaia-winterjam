# Production Deployment Guide - IPMAIA WinterJam Website

This guide outlines the proper setup for running the IPMAIA WinterJam website in a production environment, particularly on GitHub Actions runners.

## Key Changes Made

### 1. Browser-safe localStorage Access

All localStorage calls have been wrapped with `typeof window !== 'undefined'` checks to ensure they only run in browser environments and not during server-side rendering.

### 2. PM2 Configuration Improvements

The ecosystem.config.js file has been updated with better settings for production:

- `max_memory_restart`: Restarts app if memory exceeds 500MB
- `restart_delay`: Waits 3 seconds between restart attempts
- `max_restarts`: Limits to 10 restart attempts before giving up
- `autorestart`: Always restart after crashes

### 3. Next.js Configuration Optimizations

Added settings to improve robustness:

- Set reactStrictMode for better development experience
- Disabled poweredByHeader for security
- Added a custom _document.js file for better document structure

## Deployment Instructions

### Using PM2 (Recommended)

1. Build the application:
   ```
   npm run build
   ```

2. Start with PM2 using the ecosystem config:
   ```
   pm2 start ecosystem.config.js
   ```

3. Save the PM2 process list to enable restart on reboot:
   ```
   pm2 save
   ```

4. To monitor and verify the application is running:
   ```
   pm2 logs jam
   ```

### Environment Variables

Add or modify variables in the `.env` file for customization.

### Dependencies

Make sure to install all dependencies, including 'critters' which is needed for CSS optimization:

```
npm install
npm install critters
```

### Troubleshooting

If the application crashes on startup:

1. Check PM2 logs:
   ```
   pm2 logs jam
   ```

2. Verify that Node.js version is compatible (v18+ recommended)

3. Ensure the build completed successfully before starting PM2

4. Try running in non-daemon mode to see console output:
   ```
   pm2 start ecosystem.config.js --no-daemon
   ```

5. If you encounter module-related errors during build, check that all dependencies are installed:
   ```
   npm install
   ```

## Testing Production Build Locally

To verify your production build works locally before deploying:

```
npm run build
npm start
```

The application should be available at http://localhost:3000
