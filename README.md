# Sailstorm — Consent Assistant

A full-stack application for exploring and reasoning about consent/privacy data, combining a Postgres-backed API, an AI policy-analysis service, and a React frontend.

## Architecture

- **`backend/`** — Node.js/Express API (`consent-assistant-backend`) serving data from Postgres, with importers for ASIC/OAIC datasets.
- **`frontend/`** — React 19 + Vite single-page app.
- **`ai-model/`** — Python service for AI-driven policy analysis (Groq-backed).
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

| Service    | Description                          |
|------------|---------------------------------------|
| `db`       | Postgres 16                           |
| `backend`  | Express API on port 3000              |
| `ai-model` | AI policy-analysis service            |
| `frontend` | React app served on port 80           |

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

```bash
cd ai-model
pip install -r requirement.txt
python main.py
```

## Environment variables

See `.env.example` for the required variables (database credentials, `GROQ_API_KEY`, CORS origin, etc.).
