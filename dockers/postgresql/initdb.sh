#!/bin/sh

if [ ! -s "$PGDATA/PG_VERSION" ]; then
    echo "Initializing PostgreSQL database cluster..."
    initdb --username=postgres --pwfile=<(echo "$POSTGRES_PASSWORD")
    echo "Database cluster initialized."

    echo "Starting PostgreSQL temporarily for setup..."
    postgres &
    POSTGRES_PID=$!
    
    # Wait for PostgreSQL to be ready
    sleep 2
    
    echo "Creating sample database and tables..."
    psql -U postgres -d postgres <<EOF
CREATE USER postgresql WITH PASSWORD 'postgresql';
CREATE DATABASE postgresql OWNER postgresql;
GRANT ALL PRIVILEGES ON DATABASE postgresql TO postgresql;
EOF
    echo "Sample data created successfully!"
    
    # Stop the temporary PostgreSQL instance
    kill $POSTGRES_PID
    wait $POSTGRES_PID 2>/dev/null || true
else
    echo "Database cluster already exists, skipping initialization."
fi

exec "$@"
