#!/bin/bash

# Watchtower Maintenance Mode Monitor
# This script monitors Watchtower logs and manages maintenance mode automatically
# Run this as a systemd service or in screen/tmux on your server

set -euo pipefail

MAINTENANCE_FLAG="/tmp/maintenance_flag/maintenance.on"
COMPOSE_FILE="docker-compose.prod.yml"
# Container name format: <directory>-watchtower-1 (adjust if your directory name differs)
WATCHTOWER_CONTAINER="ipmaia-winterjam-watchtower-1"
LOG_FILE="/var/log/watchtower-maintenance.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

enable_maintenance() {
    log "${YELLOW}🚧 Enabling maintenance mode...${NC}"
    mkdir -p "$(dirname "$MAINTENANCE_FLAG")"
    echo "Maintenance mode enabled at $(date)" > "$MAINTENANCE_FLAG"
    if [ -f "$MAINTENANCE_FLAG" ]; then
        log "${GREEN}✅ Maintenance mode activated${NC}"
    else
        log "${RED}❌ Failed to enable maintenance mode${NC}"
    fi
}

disable_maintenance() {
    log "${BLUE}🎉 Disabling maintenance mode...${NC}"
    sleep 5  # Wait for services to stabilize
    rm -f "$MAINTENANCE_FLAG"
    if [ ! -f "$MAINTENANCE_FLAG" ]; then
        log "${GREEN}✅ Maintenance mode disabled${NC}"
    else
        log "${RED}❌ Failed to disable maintenance mode${NC}"
    fi
}

log "${GREEN}🚀 Starting Watchtower Maintenance Monitor${NC}"

# Follow Watchtower logs and react to update events
docker logs -f "$WATCHTOWER_CONTAINER" 2>&1 | while read -r line; do
    # Detect when Watchtower is about to update a container
    if echo "$line" | grep -q "Found new.*image"; then
        enable_maintenance
    fi
    
    # Detect when Watchtower finishes updating
    if echo "$line" | grep -q "Session done"; then
        disable_maintenance
    fi
    
    # Also disable on any error to prevent stuck maintenance mode
    if echo "$line" | grep -q "Error"; then
        log "${YELLOW}⚠️  Detected error, ensuring maintenance mode is off${NC}"
        disable_maintenance
    fi
done
