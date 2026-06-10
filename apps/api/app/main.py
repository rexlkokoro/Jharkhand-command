from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routers import events, districts, search, websocket
from app.db.session import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Jharkhand COMMAND API",
    description="Real-time geospatial intelligence platform for Jharkhand",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events.router, prefix="/api/v1")
app.include_router(districts.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(websocket.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "jharkhand-command-api"}
