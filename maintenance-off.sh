#!/bin/bash

# Disable maintenance mode manually

echo "🎉 Disabling maintenance mode..."

docker compose -f docker-compose.prod.yml exec nginx rm -f /var/maintenance_flag/maintenance.on

echo "✅ Maintenance mode disabled!"
echo "   Users can now access the site normally."
