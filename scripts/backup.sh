#!/bin/bash

BACKUP_DIR="/backups"
KEEP_COUNT=20

echo "Backup service started. Running every 24 hours..."

while true; do
	FILENAME="backup_$(date +%Y%m%d_%H%M%S).sql.gz"
	echo "Starting backup: $FILENAME"

	pg_dump --clean --if-exists -h "$POSTGRES_HOST" -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$BACKUP_DIR/$FILENAME"

	echo "Backup complete: $FILENAME"

	ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -n +$((KEEP_COUNT + 1)) | xargs -r rm --
	echo "Old backups cleaned up (kept last $KEEP_COUNT backups)"

	sleep 86400
done
