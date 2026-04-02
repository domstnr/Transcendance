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
    
#=====THIS DOESNT WORK, ITS JUST COPY PASTE FROM AI TO KNOW HOW IT *COULD* WORK=====

#    echo "Creating sample database and tables..."
#    psql -U postgres -d postgres <<EOF
#CREATE DATABASE myapp;
#
#\c myapp
#
#CREATE TABLE users (
#    id SERIAL PRIMARY KEY,
#    username VARCHAR(50) UNIQUE NOT NULL,
#    email VARCHAR(100) UNIQUE NOT NULL,
#    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
#);
#
#CREATE TABLE posts (
#    id SERIAL PRIMARY KEY,
#    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
#    title VARCHAR(200) NOT NULL,
#    content TEXT,
#    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
#);
#
#INSERT INTO users (username, email) VALUES
#    ('alice', 'alice@example.com'),
#    ('bob', 'bob@example.com'),
#    ('charlie', 'charlie@example.com');
#
#INSERT INTO posts (user_id, title, content) VALUES
#    (1, 'First Post', 'Hello, this is my first post!'),
#    (1, 'Second Post', 'Another interesting post.'),
#    (2, 'Bob''s Post', 'Bob here, sharing my thoughts.');
#
#EOF
    #echo "Sample data created successfully!"
    
    # Stop the temporary PostgreSQL instance
    kill $POSTGRES_PID
    wait $POSTGRES_PID 2>/dev/null || true
else
    echo "Database cluster already exists, skipping initialization."
fi

exec "$@"
