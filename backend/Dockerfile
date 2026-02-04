# Production Dockerfile for Backend
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port 5000 as requested
EXPOSE 5000

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Default command
CMD ["node", "server.js"]
