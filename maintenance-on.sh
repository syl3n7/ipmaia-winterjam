#!/bin/bash

# Enable maintenance mode manually

echo "🚧 Enabling maintenance mode..."

docker compose -f docker-compose.prod.yml exec nginx touch /var/maintenance_flag/maintenance.on

echo "✅ Maintenance mode enabled!"
echo "   Users will now see the maintenance page."
echo "   Admin panel remains accessible at api.ipmaia-winterjam.pt/admin"
echo ""
echo "To disable: ./maintenance-off.sh or use the admin panel"
