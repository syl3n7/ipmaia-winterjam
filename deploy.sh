#!/bin/bash

# IPMAIA WinterJam Docker Deployment Script
set -e

echo "🏔️  IPMAIA WinterJam Docker Deployment"
echo "======================================"

# Configuration
IMAGE_NAME="ghcr.io/syl3n7/ipmaia-winterjam:latest"
CONTAINER_NAME="ipmaia-winterjam"
PORT="3000"

# Function to check if Docker is running
check_docker() {
    if ! docker info &> /dev/null; then
        echo "❌ Docker is not running. Please start Docker and try again."
        exit 1
    fi
    echo "✅ Docker is running"
}

# Function to pull the latest image
pull_image() {
    echo "📦 Pulling latest image..."
    docker pull $IMAGE_NAME
    echo "✅ Image pulled successfully"
}

# Function to stop and remove existing container
cleanup_container() {
    if docker ps -a --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo "🛑 Stopping existing container..."
        docker stop $CONTAINER_NAME
        echo "🗑️  Removing existing container..."
        docker rm $CONTAINER_NAME
        echo "✅ Cleanup completed"
    fi
}

# Function to start new container
start_container() {
    echo "🚀 Starting new container..."
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:3000 \
        --restart unless-stopped \
        -e NODE_ENV=production \
        -e NEXT_TELEMETRY_DISABLED=1 \
        $IMAGE_NAME
    
    echo "✅ Container started successfully"
    echo "🌐 Website available at: http://localhost:$PORT"
}

# Function to setup Watchtower for auto-updates
setup_watchtower() {
    if ! docker ps --format 'table {{.Names}}' | grep -q "watchtower"; then
        echo "🔄 Setting up Watchtower for auto-updates..."
        docker run -d \
            --name watchtower \
            --restart unless-stopped \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -e WATCHTOWER_CLEANUP=true \
            -e WATCHTOWER_POLL_INTERVAL=300 \
            -e WATCHTOWER_INCLUDE_STOPPED=true \
            -e WATCHTOWER_REVIVE_STOPPED=false \
            containrrr/watchtower
        echo "✅ Watchtower setup completed (checks every 5 minutes)"
    else
        echo "✅ Watchtower is already running"
    fi
}

# Function to show status
show_status() {
    echo ""
    echo "📊 Container Status:"
    echo "==================="
    docker ps --filter name=$CONTAINER_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "🔍 To view logs: docker logs -f $CONTAINER_NAME"
    echo "🛑 To stop: docker stop $CONTAINER_NAME"
    echo "🗑️  To remove: docker rm $CONTAINER_NAME"
}

# Main deployment flow
main() {
    check_docker
    pull_image
    cleanup_container
    start_container
    
    # Ask user if they want Watchtower
    read -p "🤖 Do you want to setup Watchtower for automatic updates? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_watchtower
    fi
    
    show_status
    echo ""
    echo "🎉 Deployment completed successfully!"
}

# Run main function
main "$@"