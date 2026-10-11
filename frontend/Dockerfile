FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=
ARG VITE_AI_URL=
ARG VITE_BASE_PATH=/
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AI_URL=$VITE_AI_URL
ENV VITE_BASE_PATH=$VITE_BASE_PATH

RUN npm run build

# nginx-unprivileged runs master and workers as the "nginx" user (uid 101)
# instead of root (security plan N-02), and is kept on a current 1.2x
# release (the old 1.27.5 was flagged as outdated by nikto). It still
# listens on :80 because Docker lets unprivileged processes bind low ports
# inside a container (net.ipv4.ip_unprivileged_port_start=0).
FROM nginxinc/nginx-unprivileged:1.29-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# The image already runs as nginx (uid 101); stated explicitly so it can't
# silently change and so scanners can verify it.
USER 101

EXPOSE 80
