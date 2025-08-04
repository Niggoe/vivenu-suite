# Vivenu Suite - Dockerfile
# Multi-stage build for optimized production image

# Build Stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --silent

# Copy source code
COPY . .

# Build the application for production
RUN npm run build

# Production Stage
FROM nginx:alpine AS production

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add labels for better container management
LABEL maintainer="Vivenu Suite Team"
LABEL version="1.0.0"
LABEL description="Vivenu Suite - Ticket Barcode Management System with CSV Batch Upload"

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S vivenu -u 1001

# Set proper permissions for nginx
RUN chown -R vivenu:nodejs /usr/share/nginx/html && \
    touch /var/run/nginx.pid && \
    chown -R vivenu:nodejs /var/cache/nginx && \
    chown -R vivenu:nodejs /var/log/nginx && \
    chown -R vivenu:nodejs /var/run/nginx.pid && \
    chown -R vivenu:nodejs /etc/nginx/conf.d

# Switch to non-root user
USER vivenu

# Expose ports
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
