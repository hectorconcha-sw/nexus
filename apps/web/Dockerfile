# ─────────────────────────────────────────────────────────────
# Stage 1: build
# ─────────────────────────────────────────────────────────────
# syntax=docker/dockerfile:1.4
FROM node:22-alpine AS build
WORKDIR /repo

RUN corepack enable

# Copy workspace manifests
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.json ./
COPY apps/web/package.json ./apps/web/

# 👇 THE MAGIC: Mount a cache for the pnpm store
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --shamefully-hoist

# Copy source and build
COPY apps/web ./apps/web
RUN pnpm --filter @nexus/web build

# ─────────────────────────────────────────────────────────────
# Stage 2: runtime
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /repo

RUN corepack enable && apk add --no-cache curl tini \
 && addgroup -S app \
 && adduser -S app -G app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build --chown=app:app /repo /repo

WORKDIR /repo/apps/web
USER app

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:3000 || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["pnpm", "start"]