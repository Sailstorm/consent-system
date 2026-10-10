FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

# Run as the image's unprivileged "node" user, not root (security plan N-02).
# The importers write their temporary workbook to os.tmpdir() (/tmp), which
# is world-writable, so nothing under /app needs to be writable.
USER node

EXPOSE 3000

CMD ["node", "src/server.js"]
