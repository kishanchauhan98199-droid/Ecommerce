# ── Build stage ───────────────────────────────────────────────
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# ── Production stage ──────────────────────────────────────────
FROM node:20-alpine AS production

# Non-root user for security
RUN addgroup -S sgh && adduser -S sgh -G sgh

WORKDIR /app

# Copy from build stage
COPY --from=base --chown=sgh:sgh /app /app

USER sgh

EXPOSE 5000

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]