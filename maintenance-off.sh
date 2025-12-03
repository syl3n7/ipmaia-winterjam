#!/bin/bash

# Disable maintenance mode manually

echo "🎉 Disabling maintenance mode..."

docker compose -f docker-compose.prod.yml exec nginx rm -f /etc/nginx/maintenance.on
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "✅ Maintenance mode disabled!"
echo "   Users can now access the site normally."
