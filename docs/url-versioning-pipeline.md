# URL versioning pipeline

Matches the team's planned pipeline for the deployed site, currently
`https://52-64-225-116.sslip.io` (a free "magic DNS" hostname that resolves
to the Elastic IP with no registrar/DNS setup — see "TLS" below; swap for a
real domain later by changing `domain_name`):

| Path                 | Role                | Source                                            |
|----------------------|---------------------|----------------------------------------------------|
| `/underdevelopment/` | Active Development  | `main` HEAD — current iteration in progress        |
| `/`                  | The LIVE Root       | `stable_ref` (default git tag `iteration-1`) — always the last **complete** iteration. Password protected via `PasswordGate`. |
| `/version1/`         | The Archive         | Frozen snapshot of a retired iteration; placeholder until the first cutover |

All three (plus `/api/` and `/analyze`) are served on ports 80/443 by one
router — Caddy (`infra/router/`) — in front of two frontend containers built
from two different git checkouts, sitting on top of one shared
backend/ai-model/db stack. See `docker-compose.prod.yml` for the container
wiring and `infra/user_data.sh.tpl` for how the two checkouts are produced
on the host (`/opt/app` = active development, `/opt/app-stable` = a
`git worktree` at `stable_ref`).

## TLS

The router is Caddy, not nginx, specifically so HTTPS is automatic: it
requests and renews a Let's Encrypt cert for `domain_name` on its own (no
certbot/cron), redirects `:80` → `:443`, and persists the cert in the
`caddy-data` volume so rebuilds (`docker compose ... up -d --build`) don't
re-request it. `domain_name` and `acme_email` (Terraform variables in
`infra/variables.tf`) get written into `/opt/app/.env` as `DOMAIN` /
`ACME_EMAIL` by `user_data.sh.tpl`, which the Caddyfile reads via
`{$DOMAIN}` / `{$ACME_EMAIL}`.

The default `domain_name` is a sslip.io hostname encoding the current
Elastic IP (`52-64-225-116.sslip.io` → `52.64.225.116`). If the Elastic IP
ever changes, update `domain_name` to match the new IP (or move to a real
domain and point its DNS A record at the EIP instead) before redeploying,
since Let's Encrypt's HTTP-01 challenge needs `domain_name` to actually
resolve to this instance.

Local dev (`docker compose up --build`) is untouched — it only builds the one
`frontend` service at `/`, same as before.

## How a build knows which URL prefix it lives under

`frontend/vite.config.js` reads `VITE_BASE_PATH` (build arg) into Vite's
`base`, and `App.jsx` passes `basename={import.meta.env.BASE_URL}` to
`BrowserRouter`. The live-root build doesn't need this (it's frozen at
`iteration-1`, predating this mechanism, and defaults to `/` anyway); the
dev build is built with `VITE_BASE_PATH=/underdevelopment/`.

## Cutover runbook — when the next iteration launches

Run this when the in-progress iteration is ready to become the new live
root:

1. On `main`, tag the commit that's launching: `git tag iteration-2 <sha>`
   and push it (`git push origin iteration-2`).
2. Archive the outgoing iteration: build its frontend with
   `VITE_BASE_PATH=/version1/` from the *old* `stable_ref` and publish the
   static output to `infra/router/archive/` (or add a small `frontend-archive`
   service to `docker-compose.prod.yml` built from a `git worktree` at the
   old ref, same pattern as `frontend`/`frontend-dev`), then point the
   Caddyfile's `/version1/*` handler at it instead of the placeholder.
3. Update `stable_ref` (Terraform variable, `infra/variables.tf` default or
   `terraform.tfvars`) to `iteration-2`.
4. Re-run the deploy (new instance boot / re-run `user_data.sh.tpl`, or
   redeploy manually with the updated ref) so `/opt/app-stable` now tracks
   `iteration-2` and `/version1/` serves the frozen `iteration-1` build.

Nothing about `/underdevelopment/` changes across a cutover — it always
tracks `main` HEAD, i.e. whatever iteration is currently in progress.
