#!/bin/sh
# Periodically dumps the database (which now holds both tournament history
# and the photo gallery — see db/migrations/0001_extensions_and_tables.sql)
# to a mounted volume, and prunes dumps older than BACKUP_RETENTION_DAYS.
set -eu

: "${PGHOST:?}" "${PGUSER:?}" "${PGDATABASE:?}" "${PGPASSWORD:?}"
: "${BACKUP_INTERVAL_SECONDS:=86400}"
: "${BACKUP_RETENTION_DAYS:=14}"

mkdir -p /backups

while true; do
  timestamp=$(date -u +%Y%m%dT%H%M%SZ)
  dest="/backups/mesbg-${timestamp}.sql.gz"
  echo "[pg-backup] dumping ${PGDATABASE}@${PGHOST} to ${dest}"
  pg_dump --no-owner --format=plain | gzip > "${dest}"

  find /backups -name 'mesbg-*.sql.gz' -mtime "+${BACKUP_RETENTION_DAYS}" -delete

  sleep "${BACKUP_INTERVAL_SECONDS}"
done
