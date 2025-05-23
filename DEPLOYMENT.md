# Deployment Instructions for IPMAIA WinterJam Website

## Key Changes Made to Fix First-Start Crashes

The following changes were made to address the issue where the application crashed on first start in the GitHub runner environment:

1. **Browser-side localStorage Access**: All localStorage calls are now wrapped in `typeof window !== 'undefined'` checks to ensure they only run in browser environments.

2. **Enhanced Component Hydration**: Added improved hydration with isMounted state in components that use client-side effects.

3. **PM2 Configuration Improvements**: Updated the ecosystem.config.js with better restart and memory management settings.

4. **Next.js Configuration**: Simplified Next.js configuration to be more robust.

5. **Dependencies**: Added critters as a dependency for better CSS optimization.

## Deployment Instructions

### Option 1: Direct Start with PM2

```bash
# Build and start with PM2 in one step
npm run prod:pm2

# Or manually
npm run build
npx pm2 start ecosystem.config.js
```

### Option 2: Standard Production Start

```bash
# Build and start in one step
npm run prod

# Or manually
npm run build
npm start
```

### Monitoring and Management

```bash
# View logs
npx pm2 logs

# Restart the application
npx pm2 restart jam

# Stop the application
npx pm2 stop jam

# Remove the application from PM2
npx pm2 delete jam

# Save the PM2 process list to persist across reboots
npx pm2 save
```

## Troubleshooting

If you encounter issues:

1. Check the PM2 logs:
   ```bash
   npx pm2 logs
   ```

2. Ensure all dependencies are installed:
   ```bash
   npm install
   ```

3. Try rebuilding the application:
   ```bash
   npm run build
   ```

4. For persistent issues, try a clean start:
   ```bash
   npx pm2 delete jam
   npm run prod:pm2
   ```

## GitHub Runner Auto-start

For GitHub runners using the auto-start feature, ensure that:

1. All dependencies are correctly installed
2. The PM2 configuration is being used
3. The build step completes successfully before PM2 tries to start the application
