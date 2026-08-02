#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# FUMA LOUNGE — backup database + uploaded images.
# Schedule daily via cron:  0 3 * * *  /opt/fuma/deploy/backup.sh
# Keeps the last 14 backups.
# ─────────────────────────────────────────────────────────────
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/fuma/backups}"
STAMP="$(date +%Y%m%d_%H%M%S)"
KEEP=14

DB_SERVICE="${DB_SERVICE:-db}"
POSTGRES_USER="${POSTGRES_USER:-fuma}"
POSTGRES_DB="${POSTGRES_DB:-fuma}"
UPLOADS_VOLUME="${UPLOADS_VOLUME:-fuma_uploads}"

mkdir -p "$BACKUP_DIR"

echo "▶ Dumping database..."
docker compose exec -T "$DB_SERVICE" \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
  | gzip > "$BACKUP_DIR/db_${STAMP}.sql.gz"

echo "▶ Archiving uploaded images..."
docker run --rm \
  -v "${UPLOADS_VOLUME}:/data:ro" \
  -v "${BACKUP_DIR}:/backup" \
  alpine tar czf "/backup/uploads_${STAMP}.tar.gz" -C /data .

echo "▶ Pruning old backups (keeping last ${KEEP})..."
ls -1t "$BACKUP_DIR"/db_*.sql.gz      2>/dev/null | tail -n +$((KEEP+1)) | xargs -r rm --
ls -1t "$BACKUP_DIR"/uploads_*.tar.gz 2>/dev/null | tail -n +$((KEEP+1)) | xargs -r rm --

echo "✅ Backup complete: $BACKUP_DIR (db_${STAMP}.sql.gz, uploads_${STAMP}.tar.gz)"
