## Backups & Recovery

Backups run automatically every night via the `db-backup` service.
Retention: 7 daily, 4 weekly, 6 monthly backups stored in the `backups` Docker volume.

To restore from a backup:
  1. Make sure the stack is running (make up)
  2. Run: sudo ./scripts/restore.sh
  3. Follow the prompts to select a backup file