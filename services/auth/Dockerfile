# ─────────────────────────────────────────────────────────────
# Stage 1: build
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /repo

RUN corepack enable

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.json ./
COPY services/auth/package.json ./services/auth/

# --shamefully-hoist: pnpm's default symlinked node_modules doesn't survive
# Docker's multi-stage copy operations. This flag creates a flat layout
# so binaries like `nest` and `prisma` resolve correctly.
RUN pnpm install --frozen-lockfile --shamefully-hoist

COPY services/auth ./services/auth

WORKDIR /repo
RUN node node_modules/prisma/build/index.js generate --schema=services/auth/prisma/schema.prisma

WORKDIR /repo/services/auth
RUN pnpm run build

# ─────────────────────────────────────────────────────────────
# Stage 2: runtime
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

RUN apk add --no-cache curl tini \
 && addgroup -S app \
 && adduser -S app -G app

ENV NODE_ENV=production
ENV PORT=4001
ENV OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
ENV OTEL_SERVICE_NAME=nexus-auth

WORKDIR /repo
COPY --from=build --chown=app:app /repo /repo
COPY --from=build --chown=app:app /repo/services/auth/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
 && chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /repo/services/auth
USER app

EXPOSE 4001

HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://localhost:4001/health || exit 1

ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]