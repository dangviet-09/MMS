# Multi-stage Dockerfile for TLCN Backend
# Stage 1: Build dependencies
FROM node:18-alpine AS dependencies

# Install build tools for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    pkgconfig \
    vips-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci && npm cache clean --force

# Stage 2: Production image
FROM node:18-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    vips \
    curl

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application files
COPY index.js ./
COPY src/ ./src/
COPY tools/ ./tools/

# Create necessary directories
RUN mkdir -p uploads logs && \
    chown -R nodejs:nodejs /app

# Switch to nodejs user
USER nodejs

# Expose application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=15s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Set production environment
ENV NODE_ENV=production

# Start application
CMD ["node", "index.js"]