FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Explicitly copy the admin folder to ensure it's included
COPY admin/ ./admin/

# Debug: List what we have
RUN echo "=== Docker Build Debug ===" && \
    echo "Contents of /app:" && \
    ls -la /app/ && \
    echo "Contents of /app/admin:" && \
    ls -la /app/admin/ || echo "admin folder missing!" && \
    echo "Contents of /app/admin/dist:" && \
    ls -la /app/admin/dist/ || echo "admin/dist folder missing!" && \
    echo "admin/dist/index.html exists:" && \
    test -f /app/admin/dist/index.html && echo "YES" || echo "NO"

RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "server.js"]
