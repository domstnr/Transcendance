#!/bin/bash

set -e

echo "=== Transcendance Database Restore ==="
echo ""

BACKUPS=$(docker exec db-backup bash -c 'ls /backups/*.sql.gz 2>/dev/null | sort -r')

if [ -z "$BACKUPS" ]; then
    echo "No backups found. Make sure the db-backup container is running."
    exit 1
fi

echo "Available backups:"
echo ""

i=0
declare -a BACKUP_ARRAY
while IFS= read -r line; do
    BACKUP_ARRAY[$i]="$line"
    echo "  [$i] $(basename "$line")"
    i=$((i + 1))
done <<< "$BACKUPS"

echo ""
read -rp "Choose a backup to restore [0-$((${#BACKUP_ARRAY[@]} - 1))]: " CHOICE

SELECTED="${BACKUP_ARRAY[$CHOICE]}"

if [ -z "$SELECTED" ]; then
    echo "Invalid choice."
    exit 1
fi

echo ""
echo "Selected: $(basename "$SELECTED")"
read -rp "This will OVERWRITE the current database. Type 'yes' to confirm: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo ""
echo "Restoring..."

docker exec db-backup bash -c "gunzip -c $SELECTED | psql -h \$POSTGRES_HOST -U \$POSTGRES_USER \$POSTGRES_DB"

echo ""
echo "Restore complete."
