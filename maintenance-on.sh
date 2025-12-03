#!/bin/bash

# Enable maintenance mode manually

echo "🚧 Enabling maintenance mode..."

docker compose -f docker-compose.prod.yml exec nginx touch /etc/nginx/maintenance.on
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "✅ Maintenance mode enabled!"
echo "   Users will now see the maintenance page."
echo ""
echo "To disable: ./maintenance-off.sh"
