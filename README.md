## Backups & Recovery

Backups run automatically every night via the `db-backup` service.
Retention: Last 20 backups

For a manual backup:
make backup

To restore from a backup:
  1. Make sure the stack is running (make up)
  2. Run: make restore
  3. Follow the prompts to select a backup file