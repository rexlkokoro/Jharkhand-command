from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
import uuid

from app.db.session import get_db
from app.models.event import Event, Entity
from app.schemas.event import EventOut, EventsResponse
from app.tasks.ingest import run_all_sources

router = APIRouter(tags=["events"])


@router.get("/events", response_model=EventsResponse)
async def list_events(
    category: Optional[str] = None,
    district: Optional[str] = None,
    confidence_min: float = 0.0,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    limit: int = Query(50, le=200),
    page: int = 1,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Event).options(selectinload(Event.entities)).where(Event.is_duplicate == False)

    if category:
        cats = [c.strip() for c in category.split(",")]
        stmt = stmt.where(Event.category.in_(cats))
    if district:
        districts = [d.strip() for d in district.split(",")]
        stmt = stmt.where(Event.district.in_(districts))
    if confidence_min > 0:
        stmt = stmt.where(Event.confidence >= confidence_min)

    stmt = stmt.order_by(Event.published_at.desc())
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    stmt = stmt.offset((page - 1) * limit).limit(limit)
    result = await db.execute(stmt)
    events = result.scalars().all()

    return {"events": events, "total": total, "page": page}


@router.get("/events/{event_id}", response_model=EventOut)
async def get_event(event_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(Event).where(Event.id == event_id)
    result = await db.execute(stmt)
    event = result.scalar_one_or_none()
    if not event:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("/ingest/run")
async def trigger_ingestion():
    """Trigger manual news ingestion from all sources."""
    try:
        # Run ingestion in background
        task = run_all_sources.delay()
        return {
            "message": "Ingestion started",
            "task_id": task.id,
            "status": "processing"
        }
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")
