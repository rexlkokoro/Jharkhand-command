# Jharkhand COMMAND

> Real-time geospatial intelligence platform for Jharkhand, India.
> Palantir/Gotham-inspired dark tactical UI. Map-first. Operator-facing.

## Quick Start (Dev)

### Prerequisites
- Node.js 20+ & pnpm 9+
- Python 3.11+
- Docker & Docker Compose

### 1. Start infrastructure (Postgres + Redis)

```bash
cd infra
docker compose up postgres redis -d
```

### 2. Start mock simulator (live event feed without real APIs)

```bash
cd infra
docker compose --profile dev up mock_simulator -d
```

### 3. Start API

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. Start Frontend

```bash
cd apps/web
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Architecture

```
Browser ──► Next.js 14 (port 3000)
               │
               ├── REST  ──► FastAPI (port 8000) ──► PostgreSQL + PostGIS
               └── WS    ──► FastAPI WebSocket    ──► Redis PubSub
                                                         ▲
                                                  Mock Simulator / Celery Workers
```

## Project Structure

```
jharkhand-command/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── api/          # FastAPI backend
├── packages/
│   └── nlp/          # NLP model wrappers (Phase 4)
├── infra/
│   └── docker-compose.yml
├── PLAN.md           # Full implementation plan
└── README.md
```

## Environment Variables

### `apps/web/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### `apps/api/.env`
```
DATABASE_URL=postgresql+asyncpg://jhcmd:jhcmd_dev@localhost:5432/jharkhand_command
REDIS_URL=redis://localhost:6379
NEWSAPI_KEY=           # Phase 2
GNEWS_API_KEY=         # Phase 2
GOOGLE_GEOCODING_KEY=  # Phase 2
```

## Roadmap

See [PLAN.md](./PLAN.md) for the full 6-phase implementation plan.

| Phase | Status | Description |
|---|---|---|
| 1 — Foundation | ✅ Done | Monorepo, Next.js shell, FastAPI, Docker Compose, DB schema |
| 2 — Ingestion | 🔲 Next | NewsAPI, GNews, RSS, geocoding, Celery |
| 3 — Dashboard | 🔲 | Full map UI, real-time feed, WebSocket |
| 4 — AI/NLP | 🔲 | NER, classifier, summarization, dedup |
| 5 — Advanced | 🔲 | Heatmap, timeline replay, analytics |
| 6 — Production | 🔲 | AWS ECS, RDS, CloudFront, monitoring |
