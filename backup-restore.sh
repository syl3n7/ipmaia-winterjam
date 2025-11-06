#!/bin/bash

# WinterJam Data Backup & Restore Script
# Usage:
#   ./backup-restore.sh backup   - Create backup
#   ./backup-restore.sh restore  - Restore from backup
#   ./backup-restore.sh list     - List backups

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="ipmaia-winterjam-db-1"  # Adjust if different

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

case "$1" in
  backup)
    echo -e "${BLUE}📦 Creating database backup...${NC}"
    mkdir -p "$BACKUP_DIR"
    
    # Get database credentials from .env or use defaults
    DB_NAME=${DB_NAME:-winterjam}
    DB_USER=${DB_USER:-postgres}
    
    BACKUP_FILE="$BACKUP_DIR/winterjam_backup_$TIMESTAMP.sql"
    
    # Create backup using docker exec
    docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"
    
    echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
    echo -e "${BLUE}📊 Backup size: $(du -h $BACKUP_FILE | cut -f1)${NC}"
    ;;
    
  restore)
    echo -e "${YELLOW}🔄 Available backups:${NC}"
    ls -lh "$BACKUP_DIR"/*.sql 2>/dev/null || echo "No backups found"
    
    echo ""
    read -p "Enter backup filename (or 'latest' for most recent): " BACKUP_FILE
    
    if [ "$BACKUP_FILE" == "latest" ]; then
      BACKUP_FILE=$(ls -t "$BACKUP_DIR"/*.sql 2>/dev/null | head -1)
    else
      BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
      echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
      exit 1
    fi
    
    echo -e "${YELLOW}⚠️  This will REPLACE all current data with the backup!${NC}"
    read -p "Are you sure? (yes/no): " CONFIRM
    
    if [ "$CONFIRM" != "yes" ]; then
      echo "Cancelled."
      exit 0
    fi
    
    echo -e "${BLUE}🔄 Restoring from: $BACKUP_FILE${NC}"
    
    # Get database credentials
    DB_NAME=${DB_NAME:-winterjam}
    DB_USER=${DB_USER:-postgres}
    
    # Restore using docker exec
    cat "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" "$DB_NAME"
    
    echo -e "${GREEN}✅ Restore completed!${NC}"
    ;;
    
  list)
    echo -e "${BLUE}📋 Available backups:${NC}"
    if ls "$BACKUP_DIR"/*.sql 1> /dev/null 2>&1; then
      ls -lht "$BACKUP_DIR"/*.sql
    else
      echo "No backups found in $BACKUP_DIR"
    fi
    ;;
    
  *)
    echo "Usage: $0 {backup|restore|list}"
    echo ""
    echo "Commands:"
    echo "  backup  - Create a new database backup"
    echo "  restore - Restore database from a backup"
    echo "  list    - List all available backups"
    exit 1
    ;;
esac
