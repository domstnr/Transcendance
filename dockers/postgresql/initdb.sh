#!/bin/sh

if [ ! -s "$PGDATA/PG_VERSION" ]; then
    echo "Initializing PostgreSQL database cluster..."
    initdb --username=postgres --pwfile=<(echo "$POSTGRES_PASSWORD")
    echo "Database cluster initialized."
else
    echo "Database cluster already exists, skipping initialization."
fi

exec "$@"
