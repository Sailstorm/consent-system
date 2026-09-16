# Sailstorm — Consent Assistant

A full-stack application for exploring and reasoning about consent/privacy data, combining a Postgres-backed API, an AI policy-analysis service, and a React frontend.

The product can be tested here: https://52-64-225-116.sslip.io/privacy-assistant

Deployed environments follow a URL versioning pipeline — the live root
(`/`) is always the last complete iteration, active development lives under
`/underdevelopment/`, and retired iterations are archived under `/version1/`
etc. See [`docs/url-versioning-pipeline.md`](docs/url-versioning-pipeline.md).

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
