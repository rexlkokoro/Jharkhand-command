from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.db.session import get_db
from app.models.event import Event
from app.schemas.event import EventOut, EventsResponse

router = APIRouter(tags=["search"])


@router.get("/search", response_model=EventsResponse)
async def search_events(
    q: str = Query(..., min_length=2),
    limit: int = Query(30, le=100),
    db: AsyncSession = Depends(get_db),
):
    pattern = f"%{q}%"
    stmt = (
        select(Event)
        .where(
            Event.is_duplicate == False,
            or_(
                Event.title.ilike(pattern),
                Event.summary.ilike(pattern),
                Event.location_name.ilike(pattern),
                Event.district.ilike(pattern),
            ),
        )
        .order_by(Event.published_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    events = result.scalars().all()
    return {"events": events, "total": len(events)}
