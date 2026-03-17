# Mariadb is an sql databse for wordpress to use

# Latest version is 3.23
FROM    alpine:3.22

# Install Mariadb server and client
RUN		apk update && apk --no-cache add mariadb mariadb-client;

# Healthcheck command, used to delay start of wordpress until mariadb is set up
HEALTHCHECK --start-period=5m \
        CMD mariadb -e 'SELECT @@datadir;' || exit 1

# Allow mariadb to accept network connections
RUN     sed -i "s/#bind-address/bind-address/" /etc/my.cnf.d/mariadb-server.cnf;\
		sed -i "s/skip-networking/#skip-networking/" /etc/my.cnf.d/mariadb-server.cnf

RUN     mkdir -p /var/run/mysqld /var/lib/mysql && \
        chown -R mysql:mysql /var/run/mysqld /var/lib/mysql && \
        chmod 755 /var/run/mysqld /var/lib/mysql


# Copy over install script and give exec perms
COPY ./mariadb_install.sh /usr/local/bin/mariadb_install.sh
RUN chmod +x /usr/local/bin/mariadb_install.sh

# Expose default mariadb port
EXPOSE 3306

# Mariadb install script (if it wasnt installed yet)
ENTRYPOINT ["/usr/local/bin/mariadb_install.sh"]

# Starts mariadb as mysql user listening to all addresses
CMD ["mariadbd", "--user=mysql", "--bind-address=0.0.0.0"]