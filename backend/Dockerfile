FROM node:20.19.2-alpine3.20

WORKDIR /app

# Set production environment
ENV NODE_ENV production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production --no-cache

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Create scripts directory and copy scripts explicitly
COPY scripts/ ./scripts/

# Make scripts executable and verify they exist
RUN chmod +x scripts/*.sh scripts/*.js && \
    echo "=== Scripts Debug ===" && \
    ls -la scripts/ && \
    echo "docker-start.sh exists:" && \
    test -f scripts/docker-start.sh && echo "YES" || echo "NO" && \
    echo "docker-start.sh is executable:" && \
    test -x scripts/docker-start.sh && echo "YES" || echo "NO" && \
    echo "Full path check:" && \
    ls -la /app/scripts/docker-start.sh && \
    echo "File contents first line:" && \
    head -1 /app/scripts/docker-start.sh

EXPOSE 3001

CMD ["sh", "/app/scripts/docker-start.sh"]
