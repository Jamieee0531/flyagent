# ============================================================
# Dockerfile — Nomie API Gateway
# ============================================================
# Stage 1: Install production dependencies only
# Stage 2: Runtime image (same base, no dev tools)
# ============================================================

# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# ---- Runtime stage ----
FROM node:20-alpine

WORKDIR /app

# Copy pruned node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY package.json ./
COPY src/         ./src/

# Expose the port the Gateway listens on (default 8080)
EXPOSE 8080

# Health check — Docker will mark the container unhealthy if /health
# returns a non-2xx status, allowing docker-compose depends_on to
# wait until the service is actually ready.
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

# Run as non-root user for security best practices
USER node

CMD ["node", "src/server.js"]
