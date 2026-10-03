#!/bin/sh
set -e

cd /repo/services/catalog

echo "→ Applying Prisma migrations..."
node /repo/node_modules/prisma/build/index.js migrate deploy

echo "→ Starting catalog service..."
exec "$@"