# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for building/testing if needed)
RUN npm ci

# Copy application code
COPY . .

# Stage 2: Production Runner
FROM node:20-alpine

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code from builder
COPY --from=builder /app .

# Expose port
EXPOSE 8000

# Set Node environment
ENV NODE_ENV=production

# Default command
CMD ["npm", "start"]
