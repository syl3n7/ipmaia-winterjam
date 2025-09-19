# 🐳 Portainer Deployment Guide

## Quick Deploy to Your Portainer Instance

### Step 1: Access Portainer
Go to your Portainer instance: **https://portainer.steelchunk.eu/**

### Step 2: Create a New Stack
1. Navigate to **Stacks** in the left sidebar
2. Click **"Add Stack"**
3. Give it a name: `ipmaia-winterjam`

### Step 3: Deploy the Stack
Copy and paste the contents of `portainer-stack.yml` into the web editor, or:

1. Select **"Repository"** as the build method
2. Use this repository: `https://github.com/syl3n7/ipmaia-winterjam`
3. Set the compose file path to: `portainer-stack.yml`
4. Click **"Deploy the stack"**

### Step 4: Access Your Website
Once deployed, your website will be available at:
- **http://192.168.1.69:3000**
- Or through any reverse proxy you have configured

## 🔄 Auto-Updates

The stack includes Watchtower which will:
- Check for new images every 5 minutes
- Automatically pull and deploy updates
- Clean up old images
- Only update containers with the watchtower label

## 📊 Monitoring

In Portainer, you can:
- View container logs
- Monitor resource usage
- Restart containers
- Scale the application (if needed)
- View health check status

## 🛠️ Manual Updates

If you prefer manual updates:
1. Go to **Stacks** → `ipmaia-winterjam`
2. Click **"Update this stack"**
3. Enable **"Re-pull image"**
4. Click **"Update"**

## 🔧 Configuration

### Environment Variables
You can modify these in the Portainer stack editor:
- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`

### Port Mapping
Currently mapped to `3000:3000`. Change the first port if you need a different external port:
```yaml
ports:
  - "8080:3000"  # Website accessible on port 8080
```

### Health Checks
The container includes health checks that Portainer will display:
- ✅ Healthy: Website is responding
- ⚠️ Unhealthy: Website is not responding
- 🔄 Starting: Container is still starting up

## 🚨 Troubleshooting

### If the container won't start:
1. Check logs in Portainer: Containers → `ipmaia-winterjam` → Logs
2. Verify port 3000 isn't already in use
3. Check if the Docker node (192.168.1.69:2375) is accessible

### If auto-updates aren't working:
1. Check Watchtower logs: Containers → `watchtower-winterjam` → Logs
2. Verify Docker socket is properly mounted
3. Ensure GitHub Container Registry is accessible

### If the website shows a blank page:
1. Check container logs for errors
2. Verify all environment variables are set
3. Try restarting the container

## 📝 Notes

- The Docker image is automatically built on every push to the main branch
- Images are stored in GitHub Container Registry (ghcr.io)
- Watchtower will only update containers with the appropriate labels
- All containers have restart policies set to `unless-stopped`