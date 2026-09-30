#!/bin/sh
set -e

cd /repo/services/auth

echo "→ Applying Prisma migrations..."
node /repo/node_modules/prisma/build/index.js migrate deploy

echo "→ Starting auth service..."
exec "$@"