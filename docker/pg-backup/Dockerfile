# Same major version as the db service's postgres:16-alpine image, so
# pg_dump is guaranteed compatible with the server it's dumping.
FROM postgres:16-alpine
COPY backup.sh /usr/local/bin/backup.sh
RUN chmod +x /usr/local/bin/backup.sh
ENTRYPOINT ["/usr/local/bin/backup.sh"]
