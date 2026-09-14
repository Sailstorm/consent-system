# URL versioning pipeline

Matches the team's planned pipeline for `www.liveproject.tk`:

| Path                 | Role                | Source                                            |
|----------------------|---------------------|----------------------------------------------------|
| `/underdevelopment/` | Active Development  | `main` HEAD — current iteration in progress        |
| `/`                  | The LIVE Root       | `stable_ref` (default git tag `iteration-1`) — always the last **complete** iteration. Password protected via `PasswordGate`. |
| `/version1/`         | The Archive         | Frozen snapshot of a retired iteration; placeholder until the first cutover |

All three (plus `/api/` and `/analyze`) are served on port 80 by one router
nginx (`infra/nginx/`) in front of two frontend containers built from two
different git checkouts, sitting on top of one shared backend/ai-model/db
stack. See `docker-compose.prod.yml` for the container wiring and
`infra/user_data.sh.tpl` for how the two checkouts are produced on the host
(`/opt/app` = active development, `/opt/app-stable` = a `git worktree` at
`stable_ref`).

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
   static output to `infra/nginx/archive/` (or add a small `frontend-archive`
   service to `docker-compose.prod.yml` built from a `git worktree` at the
   old ref, same pattern as `frontend`/`frontend-dev`), then point the
   router's `/version1/` location at it instead of the placeholder.
3. Update `stable_ref` (Terraform variable, `infra/variables.tf` default or
   `terraform.tfvars`) to `iteration-2`.
4. Re-run the deploy (new instance boot / re-run `user_data.sh.tpl`, or
   redeploy manually with the updated ref) so `/opt/app-stable` now tracks
   `iteration-2` and `/version1/` serves the frozen `iteration-1` build.

Nothing about `/underdevelopment/` changes across a cutover — it always
tracks `main` HEAD, i.e. whatever iteration is currently in progress.
