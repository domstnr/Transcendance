#!/bin/sh
set -eu

echo "[entrypoint] Generating Prisma client..."
npx prisma generate

echo "[entrypoint] Applying Prisma migrations..."
npx prisma migrate deploy

echo "[entrypoint] Starting backend..."
exec "$@"
