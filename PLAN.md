# Jharkhand COMMAND — Implementation Plan

> **Internal reference doc. Keep updated as work progresses.**
> Design doc: `jharkhand_command_designdoc.html`

---

## Project Summary

**Jharkhand COMMAND** is a real-time geospatial intelligence platform for Jharkhand, India.
Palantir/Gotham-inspired dark tactical UI. Aggregates civic events, news signals, public incidents
and government alerts → NLP-processes → geo-tags → plots on a live map dashboard.

**NOT a news website. Map-first. Operator-facing.**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, TailwindCSS, Framer Motion |
| Map | Mapbox GL JS / Leaflet + React-Leaflet |
| State | Zustand |
| Backend | FastAPI (Python 3.11) |
| Task Queue | Celery + Redis broker |
| Realtime | FastAPI WebSockets + Redis PubSub |
| Cache | Redis 7 |
| Primary DB | PostgreSQL 15 + PostGIS |
| Vector Search | pgvector |
| Full-text Search | Elasticsearch / OpenSearch |
| Object Store | MinIO / S3 |
| AI/NLP | spaCy, DistilBERT, BART-large, mBART, MiniLM, VADER |
| Monorepo | Turborepo + pnpm workspaces |
| Dev Infra | Docker Compose |
| Prod Infra | AWS ECS/Fargate, RDS, ElastiCache, CloudFront, Route 53 |
| Monitoring | Grafana + Prometheus + Sentry |

---

## Repository Structure (Target)

```
jharkhand-command/
├── apps/
│   ├── web/                        # Next.js 14 frontend
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            # Map view (root)
│   │   │   ├── analytics/
│   │   │   ├── search/
│   │   │   └── timeline/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── TopBar.tsx
│   │   │   │   ├── IntelFeed.tsx
│   │   │   │   └── TimelineBar.tsx
│   │   │   ├── map/
│   │   │   │   ├── MapCanvas.tsx
│   │   │   │   ├── EventMarker.tsx
│   │   │   │   ├── HeatmapLayer.tsx
│   │   │   │   ├── DistrictLayer.tsx
│   │   │   │   └── ClusterGroup.tsx
│   │   │   ├── panels/
│   │   │   │   ├── EventDrawer.tsx
│   │   │   │   ├── AnalyticsPanel.tsx
│   │   │   │   └── FilterBar.tsx
│   │   │   └── ui/                 # Design system primitives
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useMapEvents.ts
│   │   │   └── useTimeline.ts
│   │   ├── store/                  # Zustand state slices
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── mapConfig.ts
│   │   └── public/
│   │       └── geojson/
│   │           └── jharkhand_districts.geojson
│   └── api/                        # FastAPI backend
│       ├── app/
│       │   ├── main.py
│       │   ├── routers/
│       │   │   ├── events.py
│       │   │   ├── districts.py
│       │   │   ├── search.py
│       │   │   └── websocket.py
│       │   ├── models/
│       │   │   ├── event.py
│       │   │   ├── entity.py
│       │   │   └── district.py
│       │   ├── services/
│       │   │   ├── ingestion.py
│       │   │   ├── nlp_pipeline.py
│       │   │   ├── geocoder.py
│       │   │   ├── deduplicator.py
│       │   │   └── broadcaster.py
│       │   ├── tasks/
│       │   │   ├── fetch_news.py
│       │   │   ├── fetch_rss.py
│       │   │   └── scheduler.py
│       │   └── db/
│       │       ├── session.py
│       │       └── migrations/
├── packages/
│   └── nlp/                        # Shared NLP model wrappers
│       ├── ner_model/
│       ├── classifier/
│       └── embedder/
├── infra/
│   ├── docker-compose.yml
│   ├── terraform/
│   └── nginx/
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
├── PLAN.md                         # This file
└── README.md
```

---

## UI Layout — 6 Zones

| Zone | Location | Purpose |
|---|---|---|
| 1 — Map Canvas | Center / full area | Mapbox/Leaflet, heatmap, district GeoJSON, animated markers, clustering, time replay |
| 2 — Intel Feed Sidebar | Left | Real-time scrolling event feed, color-coded by category, fly-to on click |
| 3 — Analytics Panel | Right | District stats, incident counts, sentiment gauge, hot zones list |
| 4 — Timeline Scrubber | Bottom | Playback controls (1×/5×/10×), date range picker, historical replay |
| 5 — Filter & Search Bar | Top | Keyword/entity search, category chips, district/source filter dropdowns |
| 6 — Event Detail Drawer | Overlay (slide-in) | AI summary, entities, source links, confidence score, related events |

---

## Event Categories (11)

| Category | Color |
|---|---|
| crime | `#ff3b5c` |
| politics | `#9966ff` |
| accident | `#ff8800` |
| infrastructure | `#00d4ff` |
| protest | `#ffaa00` |
| weather | `#00aaff` |
| disaster | `#ff4455` |
| economy | `#00ff88` |
| education | `#44ddff` |
| health | `#ff66aa` |
| civic | `#aaddff` |

---

## Database Schema (Key Tables)

### `events`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| title | TEXT | AI-generated or source headline |
| summary | TEXT | AI 2–3 sentence summary |
| category | ENUM | 11 categories above |
| location_name | TEXT | e.g. "Kokar, Ranchi" |
| geom | GEOMETRY(Point,4326) | PostGIS WGS84 point |
| district | TEXT | Resolved district name |
| source_url | TEXT | |
| source_name | TEXT | e.g. "Prabhatkhabar" |
| published_at | TIMESTAMPTZ | |
| ingested_at | TIMESTAMPTZ | |
| sentiment | FLOAT | -1.0 to 1.0 |
| confidence | FLOAT | 0.0 to 1.0 |
| embedding | VECTOR(768) | MiniLM for dedup + search |
| is_duplicate | BOOLEAN | |
| cluster_id | UUID FK | → event_clusters |
| raw_content | TEXT | Full original article |

### `entities`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| event_id | UUID FK | → events |
| entity_text | TEXT | Raw extracted string |
| entity_type | ENUM | PERSON \| LOCATION \| ORG \| DATE \| EVENT |
| normalized | TEXT | Canonical form |

### `event_clusters`
| Column | Type |
|---|---|
| id | UUID PK |
| centroid | GEOMETRY(Point) |
| event_count | INT |
| dominant_category | ENUM |
| time_start / time_end | TIMESTAMPTZ |

### `districts`
| Column | Type |
|---|---|
| id | UUID PK |
| name | TEXT |
| geom | GEOMETRY(MultiPolygon) |
| population | BIGINT |
| hq_city | TEXT |

---

## API Endpoints

### Events
- `GET /api/v1/events` — list with filters (category, district, bbox, date_from, date_to, confidence_min)
- `GET /api/v1/events/{id}` — full detail + entities + related
- `GET /api/v1/events/heatmap` — aggregated grid for heatmap
- `GET /api/v1/events/clusters` — cluster centroids + counts
- `GET /api/v1/events/timeline` — bucketed counts over time

### Districts & Geo
- `GET /api/v1/districts` — all 24 districts GeoJSON + event counts
- `GET /api/v1/districts/{name}/stats` — per-district breakdown

### Search & Entities
- `GET /api/v1/search?q={query}` — full-text + semantic search
- `GET /api/v1/entities/{name}` — all events for a person/place/org

### Live Feed
- `WS  ws://api/v1/feed/live` — WebSocket stream of new events
- `POST /api/v1/feed/subscribe` — register filter preferences

---

## Ingestion Pipeline (5 Steps)

```
SOURCES (every 5 min via APScheduler)
  ├─ NewsAPI        → query: "Jharkhand OR Ranchi OR Jamshedpur"
  ├─ GNews API      → lang: hi+en, country: IN, region: Jharkhand
  ├─ RSS Crawler    → Prabhatkhabar, JharkhandNews, Hindustan Jharkhand
  ├─ NDMA Feed      → disaster/weather alerts (XML)
  └─ JH Govt Press  → press.jharkhand.gov.in scraper

STEP 1: DEDUPLICATION
  → MiniLM-L6 embedding → pgvector cosine similarity (threshold 0.92)

STEP 2: JHARKHAND RELEVANCE FILTER
  → Regex + NER location check → confidence < 0.4 → discard

STEP 3: NLP PROCESSING
  ├─ NER           → spaCy → PERSON, LOCATION, ORG entities
  ├─ Classification → DistilBERT → 11-class category
  ├─ Sentiment     → VADER (EN) + multilingual BERT (HI)
  └─ Summarization → BART-large (EN) / mBART (HI)

STEP 4: GEOCODING
  → Nominatim "{location}, Jharkhand, India"
  → Fallback: Google Geocoding API
  → ST_Within() → assign district

STEP 5: STORE & BROADCAST
  → INSERT into PostgreSQL
  → Update Redis district stats cache
  → Broadcast via Redis PubSub → WebSocket subscribers
```

---

## AI / NLP Models

| Feature | Model | Output |
|---|---|---|
| Named Entity Recognition | spaCy + custom JH pipeline | PERSON, LOC, ORG spans |
| Event Classification | DistilBERT (fine-tuned, 8k JH samples) | 11-class label |
| Summarization | BART-large-cnn (EN) / mBART (HI) | 2–3 sentence summary |
| Sentiment | VADER (EN) + multilingual BERT (HI) | -1.0 to 1.0 |
| Deduplication | sentence-transformers/MiniLM-L6 | Boolean flag |
| Geocoding | Nominatim → Google Geocoding | lat/lng + confidence |
| Confidence Score | Custom ensemble | 0.0 to 1.0 |

---

## MVP Roadmap

### ✅ Phase 0 — Design (DONE)
- [x] Design document (`jharkhand_command_designdoc.html`)
- [x] Implementation plan (`PLAN.md`)

### ✅ Phase 1 — Foundation (Weeks 1–3) — COMPLETE
- [x] Turborepo monorepo init (`turbo.json`, `package.json`, `pnpm-workspace.yaml`)
- [x] `apps/web` — Next.js 14 App Router + TailwindCSS + dark design tokens
- [x] `apps/api` — FastAPI boilerplate (routers, models, services, db)
- [x] `infra/docker-compose.yml` — PostgreSQL+PostGIS, Redis, FastAPI, Celery, Next.js, mock simulator
- [x] DB models — all 4 tables (Event, Entity, EventCluster, District) via SQLAlchemy ORM
- [x] Mock simulator — `apps/api/app/services/mock_simulator.py` (no API keys needed)
- [x] WebSocket broadcaster — Redis PubSub → `useWebSocket` hook → Zustand store
- [x] Core UI shell — TopBar, IntelFeedSidebar, AnalyticsSidebar, TimelineBar, MapView
- [x] EventDetailDrawer, EventMarkerLayer, CommandLayout
- [x] Zustand store, lib/types, lib/constants, lib/api client
- [ ] Jharkhand districts GeoJSON → `apps/web/public/geojson/` *(fetch in Phase 2)*

### 🔲 Phase 2 — Ingestion Engine (Weeks 4–6)
- [ ] NewsAPI + GNews fetch tasks
- [ ] RSS crawler (3–4 sources)
- [ ] APScheduler — poll every 5 min
- [ ] Jharkhand relevance filter
- [ ] Nominatim geocoder + Google fallback
- [ ] Celery task queue wired to Redis
- [ ] Mock feed simulator for dev (no real API keys needed)

### 🔲 Phase 3 — Core Dashboard (Weeks 7–10)
- [ ] `CommandLayout` shell (TopBar, IntelFeedSidebar, AnalyticsSidebar, TimelineBar, ViewRouter)
- [ ] `MapCanvas` — Leaflet/Mapbox dark tile wrapper
- [ ] `EventMarkerLayer` — animated glow markers + radial pulse rings
- [ ] `DistrictBoundaryLayer` — GeoJSON polygon overlay, click → stats
- [ ] `MarkerClusterGroup` — zoom-level-aware (Z5–8 cluster, Z12+ individual)
- [ ] `IntelFeedSidebar` — live feed, fly-to on click
- [ ] `EventDetailDrawer` — slide-in panel
- [ ] `FilterBar` + `CategoryFilterChips`
- [ ] `useWebSocket.ts` hook → Zustand store
- [ ] Full FastAPI REST endpoints
- [ ] WebSocket broadcast via Redis PubSub
- [ ] Zustand global state store

### 🔲 Phase 4 — AI / NLP Intelligence (Weeks 11–14)
- [ ] spaCy NER pipeline
- [ ] DistilBERT 11-class event classifier
- [ ] BART / mBART summarization
- [ ] VADER + multilingual BERT sentiment
- [ ] MiniLM embedding + pgvector deduplication
- [ ] Confidence scoring ensemble
- [ ] Custom Jharkhand NER model training

### 🔲 Phase 5 — Advanced Features (Weeks 15–18)
- [ ] `HeatmapLayer` component
- [ ] `TimelineBar` + `TimeReplayController` (1×/5×/10× playback)
- [ ] `AnalyticsView` tab (charts, sentiment gauge, district heat table)
- [ ] `EntitySearchView` tab
- [ ] Elasticsearch integration
- [ ] Escalation pattern detection (burst alerts on density spikes)

### 🔲 Phase 6 — Production & Scale (Weeks 19–22)
- [ ] Terraform + AWS ECS/Fargate (web, api, worker, nlp services)
- [ ] RDS PostgreSQL Multi-AZ + ElastiCache Redis + S3 + CloudFront
- [ ] Grafana + Prometheus + Sentry monitoring
- [ ] Auth system (if required)
- [ ] Hindi UI localization
- [ ] Load testing (target: 500 concurrent users)

---

## Design Tokens (Dark Tactical Theme)

```
--bg:           #080c10
--bg2:          #0d1117
--panel:        #0a0f16
--border:       #1a2535
--accent:       #00d4ff   (cyan — primary)
--green:        #00ff88
--amber:        #ffaa00
--red:          #ff3b5c
--purple:       #9966ff
--text:         #c8d8e8
--text-dim:     #4a6480
--text-mid:     #7a9ab8
--font-mono:    'Share Tech Mono', monospace
--font-display: 'Barlow Condensed', sans-serif
--font-body:    'Barlow', sans-serif
```

---

## Key Decisions & Constraints

- **Map library:** Prefer Leaflet + React-Leaflet for MVP (no Mapbox token needed). Swap to Mapbox GL for production if custom tile styles required.
- **No article/blog UI patterns** — everything is map-first, data-dense, operator-facing.
- **Mock simulator first** — all dev done against mock feed, no real API keys required until Phase 2 integration testing.
- **Hindi + English** — ingestion and NLP must handle both languages from day 1.
- **Confidence gate:** Events with geocoding confidence < 0.5 are stored but not shown on map by default.
- **Zoom behavior:** Z5–8 = cluster bubbles only; Z9–11 = sub-clusters + district labels; Z12–14 = individual markers; Z15+ = full detail.

---

## Current Status — Jun 10, 2026

**Phase 1 is complete. Starting Phase 2.**

### ✅ Done (Phase 1)
| Item | Detail |
|---|---|
| Monorepo root | `turbo.json`, `package.json`, `pnpm-workspace.yaml` — pnpm 9 + Turborepo 2 |
| `apps/web` | Next.js 14.2.5 (App Router), TailwindCSS, dark tactical theme, design tokens |
| Core UI shell | `CommandLayout`, `TopBar`, `IntelFeedSidebar`, `AnalyticsSidebar`, `TimelineBar` |
| Map layer | `MapView` (Leaflet + React-Leaflet, CartoDB Dark tiles), `EventMarkerLayer` (glow icons, tooltips) |
| Event detail | `EventDetailDrawer` — AI summary, entities, metrics, source link |
| State management | Zustand store (`useAppStore`) — events, filters, selected event, live/pause toggle |
| API client | `lib/api.ts` — REST wrappers for `/events`, `/districts`, `/search` |
| WebSocket hook | `hooks/useWebSocket.ts` — Redis PubSub → Zustand store, auto-reconnect |
| FastAPI backend | `apps/api/app/main.py` + 4 routers: events, districts, search, websocket |
| DB models | SQLAlchemy ORM — `Event`, `Entity`, `EventCluster` (PostGIS + pgvector-ready) |
| Redis broadcaster | Pub/Sub service — `broadcaster.publish()` / `broadcaster.subscribe()` |
| Mock simulator | `app/services/mock_simulator.py` — streams realistic fake JH events, no API keys |
| Docker Compose | `infra/docker-compose.yml` — PostgreSQL+PostGIS 15, Redis 7, API, mock sim, web |
| Dockerfiles | `apps/api/Dockerfile`, `apps/web/Dockerfile` (multi-stage) |
| Dev server | `http://localhost:3000` — **running, 0 TypeScript errors** |

### 🔲 Up Next (Phase 2 — Ingestion Engine)
- [ ] Celery worker + Redis broker wiring (`celery_app.py`, `tasks/ingest.py`)
- [ ] APScheduler — poll every 5 min
- [ ] NewsAPI fetch task (`services/newsapi.py`)
- [ ] GNews fetch task (`services/gnews.py`)
- [ ] RSS crawler — Prabhatkhabar, Jagran, NDMA XML (`services/rss_crawler.py`)
- [ ] Jharkhand relevance filter — keyword + district matching
- [ ] Geocoder — Nominatim primary, Google Maps fallback (`services/geocoder.py`)
- [ ] Jharkhand districts GeoJSON → `apps/web/public/geojson/jharkhand_districts.geojson`
- [ ] `DistrictBoundaryLayer` component wired to GeoJSON

### Commands to run the current stack locally
```powershell
# Start infra
cd infra; docker compose up postgres redis -d

# Start API (in apps/api venv)
uvicorn app.main:app --reload --port 8000

# Start mock event stream
python -m app.services.mock_simulator

# Start frontend (from repo root)
pnpm --filter @jharkhand-command/web dev
```

*Last updated: Phase 1 complete — Jun 10, 2026.*
