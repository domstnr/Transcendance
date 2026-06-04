## Starting the project

To start the project, these are all the necessary steps :

1. Copy .env.example to .env and fill in the desired values
2. Run make certs to generate the SSL certificate
3. Run make all to build and start everything
4. Visit https://localhost and accept the certificate warning

## Backups & Recovery

Backups run automatically every night via the `db-backup` service.
Retention: Last 20 backups

For a manual backup:
make backup

To restore from a backup:
  1. Make sure the stack is running (make up)
  2. Run: make restore
  3. Follow the prompts to select a backup file