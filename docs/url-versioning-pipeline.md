# URL versioning pipeline

One deployed host serves every version of the app side by side, at
`https://52-64-225-116.sslip.io`. That's a free "magic DNS" hostname that
resolves to the Elastic IP with no registrar or DNS setup (see "TLS" below).
To move to a real domain later, change `domain_name`.

| URL | Role | Source |
|-----|------|--------|
| https://52-64-225-116.sslip.io/ | **The LIVE Root** | `stable_ref`, currently git tag `iteration-2.1`. Always the last **complete** iteration. Password protected through `PasswordGate`. |
| https://52-64-225-116.sslip.io/underdevelopment/ | **Active Development** | `main` HEAD, the iteration currently in progress. |
| https://52-64-225-116.sslip.io/version1/ | **The Archive** | `archive_ref`, currently git tag `iteration-1-archived`. Iteration 1, frozen. |

`stable_ref` and `archive_ref` are Terraform variables in
`infra/variables.tf`.

All three paths, plus `/api/` and `/analyze`, are served on ports 80/443 by
one router, Caddy (`infra/router/Caddyfile`). It sits in front of three
frontend containers built from three different git checkouts, and all of
them share a single backend, developed_ai and db stack. Container wiring is
in `docker-compose.prod.yml`. `infra/user_data.sh.tpl` creates the
checkouts on the host:

| Host path | Checkout | Compose service | Served at |
|-----------|----------|-----------------|-----------|
| `/opt/app` | `main` HEAD (clone) | `frontend-dev` | `/underdevelopment/` |
| `/opt/app-stable` | `git worktree` at `stable_ref` | `frontend` | `/` |
| `/opt/app-archive` | `git worktree` at `archive_ref` | `frontend-archive` | `/version1/` |

The router strips the prefix (`handle_path`) before forwarding to
`frontend-dev` and `frontend-archive`, so each container serves its own
`dist` root.

## Tag history

| Tag | Commit | Meaning |
|-----|--------|---------|
| `iteration-1` | `08e176a` | End of Iteration 1 (original boundary). |
| `iteration-1-archived` | `9a2f28e` | `iteration-1` plus one patch: `BrowserRouter basename="/version1/"`, so it can be served from the archive path. This is what `/version1/` serves. |
| `iteration-2` | `f81cbde` | Iteration 2 launch. This was the live root at the first cutover. |
| `iteration-2.1` | `5c37441` | Patch cutover that brought post-launch fixes (evidence-based source text, Stage 1 evidence cap) to the live root. This is the current live root. |

## TLS

The router is Caddy rather than nginx specifically so HTTPS is automatic. It
requests and renews a Let's Encrypt cert for `domain_name` on its own (no
certbot or cron), redirects `:80` to `:443`, and persists the cert in the
`caddy-data` volume, so rebuilds (`docker compose ... up -d --build`) don't
re-request it. `user_data.sh.tpl` writes `domain_name` and `acme_email` into
`/opt/app/.env` as `DOMAIN` and `ACME_EMAIL`. The Caddyfile reads them via
`{$DOMAIN}` and `{$ACME_EMAIL}`.

The default `domain_name` is a sslip.io hostname that encodes the current
Elastic IP (`52-64-225-116.sslip.io` → `52.64.225.116`). Let's Encrypt's
HTTP-01 challenge needs `domain_name` to resolve to this instance. So if the
Elastic IP ever changes, update `domain_name` to match it (or move to a real
domain and point its DNS A record at the EIP) before redeploying.

Local dev (`docker compose up --build`) is untouched. It only builds the one
`frontend` service at `/`.

## How a build knows which URL prefix it lives under

- **Live root and active development:** `frontend/vite.config.js` reads the
  `VITE_BASE_PATH` build arg into Vite's `base`, and `App.jsx` passes
  `basename={import.meta.env.BASE_URL}` to `BrowserRouter`. The dev build
  uses `VITE_BASE_PATH=/underdevelopment/`. The live root uses the
  default `/`.
- **Archive:** the iteration-1 code predates `VITE_BASE_PATH`, so it's built
  through `infra/frontend-archive/Dockerfile`. That Dockerfile lives in the
  current checkout, not the archived one, and runs
  `vite build --base=/version1/` so asset URLs resolve under the prefix. The
  `iteration-1-archived` tag supplies the matching React Router basename.
  Without the basename, no route under `/version1/` matches at all.

## Cutover runbook: when the next iteration launches

Run this when the in-progress iteration is ready to become the new live
root:

1. **Tag the launching commit on `main`:** `git tag iteration-N <sha>` and
   `git push origin iteration-N`.
2. **Archive the outgoing iteration** (the current `stable_ref`):
   - If its code already reads `VITE_BASE_PATH` (true for Iteration 2
     onwards), it needs no patch. Add another archive service and worktree
     (for example `frontend-archive-2` and `/opt/app-archive-2`), built with
     `VITE_BASE_PATH=/version2/`. Then add a matching
     `handle_path /version2/*` block to the Caddyfile.
   - If it predates that mechanism, follow the `iteration-1-archived`
     pattern: tag a one-line basename patch and build it with a forced
     `--base`.
3. **Point `stable_ref` at the new tag** (default in `infra/variables.tf`, or
   in `terraform.tfvars`).
4. **Redeploy:** boot a new instance, re-run `user_data.sh.tpl`, or redeploy
   manually with the updated refs.

**Patch cutover** (for example `iteration-2` → `iteration-2.1`): use this to
bring fixes from `main` to the live root without launching a new iteration.
Do only steps 1, 3 and 4. The archive is left unchanged.

Nothing about `/underdevelopment/` changes across a cutover. It always
tracks `main` HEAD, which is whatever iteration is currently in progress.
