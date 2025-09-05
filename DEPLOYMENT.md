# Deployment Instructions for IPMAIA WinterJam Website

## Cloudflare Pages Deployment

This project is configured to deploy to Cloudflare Pages, providing fast global distribution and automatic deployments from GitHub.

### Setup Instructions

#### 1. Cloudflare Account Setup
1. Create a Cloudflare account at [cloudflare.com](https://cloudflare.com)
2. Get your Account ID from the Cloudflare dashboard (right sidebar)
3. Create an API token with the following permissions:
   - `Cloudflare Pages:Edit`
   - `Account:Read`

#### 2. GitHub Repository Setup
Add the following secrets to your GitHub repository settings:
- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID

#### 3. Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run export
```

#### 4. Manual Deployment
If you have Wrangler CLI installed locally:
```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy manually
npm run export
npm run deploy
```

### Automatic Deployment

The project automatically deploys to Cloudflare Pages when:
- Code is pushed to the `main` branch
- Manual workflow trigger is used

### Project Configuration

The project uses:
- **Next.js Static Export**: Generates static files for optimal performance
- **Cloudflare Pages**: Global CDN distribution
- **GitHub Actions**: Automated CI/CD pipeline

### Build Configuration

- Output directory: `out/`
- Build command: `npm run export`
- Node.js version: 18
- Static site generation with image optimization disabled for compatibility

### Troubleshooting

1. **Build Failures**: Check that all dependencies are properly installed and the build runs locally
2. **Deployment Issues**: Verify that Cloudflare secrets are correctly set in GitHub
3. **Image Issues**: Images are set to `unoptimized: true` for static export compatibility

### Migration from GitHub Runner

This deployment has been migrated from a self-hosted GitHub runner with PM2 to Cloudflare Pages for:
- Better reliability and uptime
- Global CDN distribution
- Automatic scaling
- Simplified maintenance
