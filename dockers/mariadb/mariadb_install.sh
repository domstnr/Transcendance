#!/bin/sh

# Check if databse exists already
if [ -d  /var/lib/mysql/mysql ]; then
    echo "MariaDB is already installed"
else

    # Ensure folder structure
    mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
    
    # Run bootstrap, set root password, create wordpress database
    mariadbd --user=mysql --bootstrap <<- EOF
    USE mysql;
    FLUSH PRIVILEGES;
    GRANT ALL ON *.* TO 'root'@'%' IDENTIFIED BY 'root4groot';
    FLUSH PRIVILEGES;
EOF
    #CREATE DATABASE IF NOT EXISTS $SQL_DATABASE;

    # Start mariadb and remember PID for later kill
    mariadbd --user=mysql --bind-address=0.0.0.0 & MARIADB_PID=$!
    # Wait for it to initialize
    sleep 3

    # Create wordpress user (cannot create during bootstrap due to auth tables not being set up yet, workaround)
    # Delete anon user
    #mariadb -u root -p$SQL_ROOT_PASSWORD <<- EOF
    #CREATE USER '$SQL_USER'@'%' IDENTIFIED BY '$SQL_PASSWORD';
    #GRANT ALL ON $SQL_DATABASE.* TO '$SQL_USER'@'%';
    #DELETE FROM mysql.user WHERE User='';
    #FLUSH PRIVILEGES;
#EOF

    # Kill the current mariadb process after we created the wordpress user
    # This needs to be done otherwise it would block the mariadb in exec from starting
    kill $MARIADB_PID
    # Waits for graceful shutdown redirecting errors to nothing, and a fallback to true
    wait $MARIADB_PID 2>/dev/null || true
fi

# Run CMD from docker file (preserves signal handling compared to direct execution)
exec "$@"