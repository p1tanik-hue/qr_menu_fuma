#!/bin/sh
set -e

echo "▶ Applying database migrations..."
npx prisma migrate deploy

# Seed only when explicitly requested (RUN_SEED=true) and DB is empty-ish.
if [ "$RUN_SEED" = "true" ]; then
  echo "▶ Seeding database (RUN_SEED=true)..."
  npm run db:seed || echo "⚠ Seed skipped/failed (already seeded?)"
fi

echo "▶ Starting FUMA LOUNGE..."
exec "$@"
