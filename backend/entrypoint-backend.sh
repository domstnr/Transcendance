#!/bin/sh
set -eu

echo "[entrypoint] Generating Prisma client..."
npx prisma generate

#echo "[entrypoint] Generating Prisma migration..."
#npx prisma migrate reset --force
#npx prisma migrate dev --name init

echo "[entrypoint] Applying Prisma migrations..."
npx prisma migrate deploy

echo "[entrypoint] Starting backend..."
exec "$@"
