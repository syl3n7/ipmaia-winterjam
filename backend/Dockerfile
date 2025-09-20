FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Ensure admin folder exists and has correct permissions
RUN ls -la admin/ || echo "Admin folder not found!"
RUN ls -la admin/dist/ || echo "Admin dist folder not found!"
RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "server.js"]
