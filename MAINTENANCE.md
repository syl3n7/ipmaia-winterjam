# Maintenance Mode

Automatic maintenance page system for deployments.

## 🚀 How It Works

### During Deployment
When you run `./deploy-docker.sh`, the script automatically:
1. **Enables maintenance mode** before stopping services
2. Shows users a beautiful maintenance page with auto-refresh
3. **Disables maintenance mode** after services are healthy

### What Users See
- 🎮 Branded maintenance page with WinterJam theme
- ⏱️ Auto-refresh countdown (checks every 10 seconds)
- 🔄 Automatic redirect when services are back online
- 📱 Responsive design for mobile/desktop

## 🛠️ Manual Control

### Enable Maintenance Mode
```bash
./maintenance-on.sh
```
Use this when you need to:
- Perform manual maintenance
- Update configuration
- Test the maintenance page

### Disable Maintenance Mode
```bash
./maintenance-off.sh
```
Brings the site back online immediately.

## 📋 Files

- `maintenance.html` - The maintenance page (auto-refreshing)
- `maintenance-on.sh` - Manual enable script
- `maintenance-off.sh` - Manual disable script
- `nginx.prod.conf` - Nginx configuration with maintenance mode support

## 🎨 Customization

Edit `maintenance.html` to customize:
- Colors and branding
- Messages and timing
- Refresh interval (default: 10 seconds)

## 🔧 Technical Details

### How It Detects Services Are Back
The page uses JavaScript to:
1. Send HEAD requests to `/` every 10 seconds
2. Check if the response is no longer the maintenance page
3. Automatically reload when services are healthy

### Nginx Configuration
The maintenance mode is controlled by a flag file:
- **On**: `/etc/nginx/maintenance.on` exists
- **Off**: Flag file is removed

The deploy script manages this automatically.

## ⚠️ Important Notes

- Maintenance mode is **automatically** enabled during deployment
- The page checks status every **10 seconds**
- Health checks (`/health` endpoint) bypass maintenance mode
- No user action required - page auto-reloads when ready

## 🎯 Best Practices

1. **Regular deployments**: No action needed, it's automatic
2. **Emergency maintenance**: Use `maintenance-on.sh`
3. **Testing**: Enable manually, verify the page, then disable
4. **Monitoring**: Check logs with `docker compose -f docker-compose.prod.yml logs nginx`
