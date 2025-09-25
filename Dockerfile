FROM node:20.19.2-alpine3.20 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --no-cache

FROM node:20.19.2-alpine3.20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-cache
COPY . .
RUN npm run build

FROM node:20.19.2-alpine3.20 AS runner
WORKDIR /app
ENV NODE_ENV production

RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
