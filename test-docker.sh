#!/bin/bash

# Quick Docker build test
echo "🧪 Testing Docker build..."

# Build the image
docker build -t ipmaia-winterjam-test . || {
    echo "❌ Docker build failed"
    exit 1
}

echo "✅ Docker build successful"

# Test run (optional)
read -p "🚀 Do you want to test run the container locally? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🏃 Starting test container..."
    docker run -d --name ipmaia-winterjam-test -p 3001:3000 ipmaia-winterjam-test
    
    echo "⏳ Waiting for container to start..."
    sleep 10
    
    echo "🌐 Testing localhost:3001..."
    if curl -f http://localhost:3001 > /dev/null 2>&1; then
        echo "✅ Container is running successfully!"
        echo "🌐 Visit: http://localhost:3001"
    else
        echo "❌ Container test failed"
        docker logs ipmaia-winterjam-test
    fi
    
    echo "🧹 Cleanup test container? (y/N):"
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker stop ipmaia-winterjam-test
        docker rm ipmaia-winterjam-test
        docker rmi ipmaia-winterjam-test
        echo "✅ Cleanup complete"
    fi
fi