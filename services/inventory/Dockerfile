# syntax=docker/dockerfile:1.4
# ─────────────────────────────────────────────────────────────
# Stage 1: build
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /repo

RUN corepack enable

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.json ./
COPY services/inventory/package.json ./services/inventory/

# Install only inventory dependencies, using cache
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --filter @nexus/inventory... --frozen-lockfile --shamefully-hoist --prefer-offline

# Copy source and generate Prisma client
COPY services/inventory ./services/inventory
WORKDIR /repo
RUN node node_modules/prisma/build/index.js generate --schema=services/inventory/prisma/schema.prisma

# Build
WORKDIR /repo/services/inventory
RUN ./node_modules/.bin/nest build

# Create a pruned, production-only directory
WORKDIR /repo
RUN pnpm --filter @nexus/inventory --prod deploy /prod/inventory --prefer-offline

# ─────────────────────────────────────────────────────────────
# Stage 2: runtime
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

RUN apk add --no-cache curl tini \
 && addgroup -S app \
 && adduser -S app -G app

ENV NODE_ENV=production
ENV PORT=4004

WORKDIR /app
COPY --from=build --chown=app:app /prod/inventory /app

# Copy the migrations so the entrypoint can apply them
COPY --from=build --chown=app:app /repo/services/inventory/prisma ./prisma
COPY --from=build --chown=app:app /repo/services/inventory/prisma.config.ts ./prisma.config.ts
COPY --from=build --chown=app:app /repo/services/inventory/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER app

EXPOSE 4004

HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://localhost:4004/health || exit 1

ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]