FROM node:20.19.2-alpine3.20 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --no-cache

FROM node:20.19.2-alpine3.20 AS builder
WORKDIR /app

# Accept build arguments
ARG NEXT_PUBLIC_API_URL=https://api.ipmaia-winterjam.pt/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package*.json ./
RUN npm ci --no-cache
COPY . .
RUN npm run build

FROM node:20.19.2-alpine3.20 AS runner
WORKDIR /app
ENV NODE_ENV production

# Install su-exec for safe user switching
RUN apk add --no-cache su-exec

RUN adduser -S nextjs -u 1001

# Copy public files to a temporary location for syncing to shared volume
COPY --from=builder /app/public ./public-init
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

# Copy entrypoint script
COPY scripts/frontend-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Create empty public directory (will be mounted as shared volume)
RUN mkdir -p ./public && chown -R nextjs:nogroup ./public

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
