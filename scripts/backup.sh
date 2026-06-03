#!/bin/bash

BACKUP_DIR="/backups"
KEEP_DAYS=7

echo "Backup service started. Running daily at 02:00..."

while true; do
	sleep $(( $(date -d 'tomorrow 02:00' +%s) - $(date +%s) ))

	FILENAME="backup_$(date +%Y%m%d_%H%M%S).sql.gz"
	echo "Starting backup: $FILENAME"

	pg_dump -h "$POSTGRES_HOST" -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$BACKUP_DIR/$FILENAME"

	echo "Backup complete: $FILENAME"

	find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$KEEP_DAYS -delete
	echo "Old backups cleaned up (kept last $KEEP_DAYS days)"
done