# syntax=docker/dockerfile:1.4
# ─────────────────────────────────────────────────────────────
# Stage 1: build
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /repo

RUN corepack enable

# Copy workspace manifests
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.json ./
COPY services/cart/package.json ./services/cart/

# Install using the cache, and prefer offline to stop registry checks
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --filter @nexus/cart... --frozen-lockfile --shamefully-hoist --prefer-offline

# Copy source and build
COPY services/cart ./services/cart
WORKDIR /repo/services/cart

# 👇 THE MAGIC FIX: Call the binary directly to bypass pnpm workspace checks
RUN ./node_modules/.bin/nest build

# Create a pruned, production-only directory (prefer offline stops network timeouts)
WORKDIR /repo
RUN pnpm --filter @nexus/cart --prod deploy /prod/cart --prefer-offline

# ─────────────────────────────────────────────────────────────
# Stage 2: runtime
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

RUN apk add --no-cache curl tini \
 && addgroup -S app \
 && adduser -S app -G app

ENV NODE_ENV=production
ENV PORT=4003

WORKDIR /app
COPY --from=build --chown=app:app /prod/cart /app

USER app

EXPOSE 4003

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:4003/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]