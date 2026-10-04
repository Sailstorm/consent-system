# Sailstorm — Consent Assistant

A full-stack application for exploring and reasoning about consent/privacy data, combining a Postgres-backed API, an AI policy-analysis service, and a React frontend.

## Live URLs

One deployed host serves every version of the app side by side, each under
its own URL path:

| URL | Role | What it serves |
|-----|------|----------------|
| https://52-64-225-116.sslip.io/ | **Live root** | The last *complete* iteration, currently git tag `iteration-2.1`. Password protected. |
| https://52-64-225-116.sslip.io/underdevelopment/ | **Active development** | `main` HEAD, the iteration currently in progress. |
| https://52-64-225-116.sslip.io/version1/ | **Archive** | Iteration 1, frozen (git tag `iteration-1-archived`). |

All three share the same backend (`/api/*`), AI service (`/analyze`) and
database. Only the frontend differs between them.

### Versioning logic

- **`/` always lags behind `main`.** It's pinned to a git tag through the
  Terraform variable `stable_ref` (`infra/variables.tf`), so ongoing work on
  `main` never reaches the live root by accident.
- **`/underdevelopment/` always tracks `main`.** Every redeploy picks up the
  latest commit. Its frontend is built with `VITE_BASE_PATH=/underdevelopment/`
  so assets and routes resolve under that prefix.
- **`/versionN/` holds retired iterations.** It's pinned through
  `archive_ref`. The archive uses `iteration-1-archived` rather than
  `iteration-1`. The original iteration-1 code predates sub-path support,
  so that tag adds a one-line patch: a React Router
  `basename="/version1/"`. It's built with `vite build --base=/version1/`
  through `infra/frontend-archive/Dockerfile`.
- **Cutover:** when an iteration is complete, tag the commit on `main`
  (for example `git tag iteration-3 <sha>`), point `stable_ref` at the new
  tag, move the outgoing iteration into the archive, and redeploy. A patch
  cutover (`iteration-2` → `iteration-2.1`) only retags and bumps
  `stable_ref`, so the archive is left unchanged.

The routing is handled by Caddy (`infra/router/Caddyfile`), which also
provisions HTTPS automatically. The container wiring lives in
`docker-compose.prod.yml`. Full design and runbook:
[`docs/url-versioning-pipeline.md`](docs/url-versioning-pipeline.md).

## Architecture

- **`backend/`** — Node.js/Express API (`consent-assistant-backend`) serving data from Postgres, with importers for ASIC/OAIC datasets.
- **`frontend/`** — React 19 + Vite single-page app.
- **`developed_ai/`** — Python/FastAPI service for AI-driven policy analysis: a local DeBERTa classifier (Stage 1) plus an NVIDIA-hosted LLM summariser (Stage 2).
- **`ai-model/`** — retired Groq-backed policy-analysis service, kept in the tree but no longer built or deployed.
- **`database/`** — SQL schema/init scripts.
- **`infra/`** — Deployment infrastructure (Terraform/EC2).
- **`docs/`** — Project and security documentation.

## Running locally

The project is orchestrated with Docker Compose:

```bash
cp .env.example .env   # fill in required secrets
docker compose up --build
```

This starts four services:

| Service        | Description                          |
|----------------|---------------------------------------|
| `db`           | Postgres 16                           |
| `backend`      | Express API on port 3000              |
| `developed_ai` | AI policy-analysis service            |
| `frontend`     | React app served on port 80           |

### Backend only

```bash
cd backend
npm install
npm run dev
```

### Frontend only

```bash
cd frontend
npm install
npm run dev
```

### AI model service

Run from the repository root (not from inside `developed_ai/`) — the service
uses relative imports and must be run as a package:

```bash
python -m pip install -r developed_ai/requirements.txt
python -m uvicorn developed_ai.main:app --reload --port 8000
```

## Environment variables

See `.env.example` for the required variables (database credentials, `NVIDIA_API_KEY`, CORS origin, etc.).
