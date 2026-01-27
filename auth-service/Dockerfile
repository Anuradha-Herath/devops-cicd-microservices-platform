# syntax=docker/dockerfile:1.4
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with BuildKit cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm install --omit=dev --prefer-offline --no-audit

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy dependencies and application
COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 5001

CMD ["node", "server.js"]
