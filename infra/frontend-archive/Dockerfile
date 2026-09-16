# Builds an archived iteration's frontend (build context is the archive
# git worktree - see docker-compose.prod.yml's frontend-archive service)
# with a forced Vite --base override, so its asset/index.html references
# resolve correctly under /version1/. Lives in the current (unfrozen)
# checkout rather than the archived one on purpose: that code predates
# VITE_BASE_PATH support entirely (no ARG plumbing, no --base flag), and
# without this override its absolute-root asset paths (e.g.
# /assets/index-XXXX.js) resolve against the domain root instead of
# /version1/, landing on whatever the live root happens to be serving -
# usually a 404 (different build, different hashed filenames), which is
# why the archive rendered as a blank page before this existed.
#
# This does NOT fix client-side navigation within the archive drifting
# out of the /version1/ prefix (that needs a React Router `basename`,
# which the archived App.jsx never reads) - known, accepted limitation.
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx vite build --base=/version1/

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
