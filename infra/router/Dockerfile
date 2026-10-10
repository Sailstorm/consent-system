FROM caddy:2-alpine

# Run Caddy as an unprivileged user (security plan N-02). It still binds
# :80/:443 because Docker lets unprivileged processes bind low ports inside
# a container (net.ipv4.ip_unprivileged_port_start=0). /data (certificates)
# and /config are owned by this user; on a host upgrading from the old
# root-run router, user_data.sh.tpl chowns the existing caddy-data volume.
RUN addgroup -S -g 10002 caddy \
 && adduser -S -D -H -u 10002 -G caddy caddy \
 && mkdir -p /data /config \
 && chown -R caddy:caddy /data /config

COPY Caddyfile /etc/caddy/Caddyfile

USER caddy
