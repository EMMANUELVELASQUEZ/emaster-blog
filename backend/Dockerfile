# ─────────────────────────────────────────────
# Stage 1: Base
# ─────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache curl
COPY package*.json ./

# ─────────────────────────────────────────────
# Stage 2: Development
# ─────────────────────────────────────────────
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# ─────────────────────────────────────────────
# Stage 3: Build / Production deps only
# ─────────────────────────────────────────────
FROM base AS production-deps
ENV NODE_ENV=production
RUN npm ci --only=production && npm cache clean --force

# ─────────────────────────────────────────────
# Stage 4: Production
# ─────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Security: non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
COPY --from=production-deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

USER nodejs
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]
