FROM alpine:3.23

RUN apk update && apk add --no-cache \
    postgresql17

RUN mkdir -p /run/postgresql && \
    chown -R postgres:postgres /run/postgresql && \
    chmod 700 /run/postgresql

WORKDIR /var/lib/postgresql

COPY ./initdb.sh /usr/local/bin/initdb.sh
RUN chmod +x /usr/local/bin/initdb.sh

EXPOSE 5432

ENV PGDATA=/var/lib/postgresql/data
ENV POSTGRES_PASSWORD=postgresql

STOPSIGNAL SIGINT

USER postgres

ENTRYPOINT ["/usr/local/bin/initdb.sh"]

CMD ["postgres"]
#CMD ["sh", "-c", "tail -f /dev/null"]
