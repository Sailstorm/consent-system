FROM caddy:2-alpine

# Run Caddy as an unprivileged user (security plan N-02). It still binds
# :80/:443 because Docker lets unprivileged processes bind low ports inside
# a container (net.ipv4.ip_unprivileged_port_start=0). /data (certificates)
# and /config are owned by this user, and a new caddy-data volume inherits
# that. Upgrading in place on a host whose volume was created by the old
# root-run router needs a one-off: docker run --rm -v app_caddy-data:/data
# alpine chown -R 10002:10002 /data
# The official image grants /usr/bin/caddy the cap_net_bind_service file
# capability. Under cap_drop: ALL + no-new-privileges (docker-compose.prod.yml)
# the kernel refuses to exec a binary carrying file capabilities ("exec
# /usr/bin/caddy: operation not permitted"), and it isn't needed: low ports
# are already bindable unprivileged inside the container (see above).
RUN apk add --no-cache libcap \
 && setcap -r /usr/bin/caddy \
 && apk del libcap

RUN addgroup -S -g 10002 caddy \
 && adduser -S -D -H -u 10002 -G caddy caddy \
 && mkdir -p /data /config \
 && chown -R caddy:caddy /data /config

COPY Caddyfile /etc/caddy/Caddyfile

USER caddy
