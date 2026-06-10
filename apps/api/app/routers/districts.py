from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.event import Event

router = APIRouter(tags=["districts"])

JHARKHAND_DISTRICTS = [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh",
    "Deoghar", "Giridih", "Dumka", "Chaibasa", "Palamu",
    "Garhwa", "Lohardaga", "Simdega", "Chatra", "Koderma",
    "Ramgarh", "Khunti", "Saraikela", "Godda", "Sahebganj",
    "Pakur", "Jamtara", "Latehar", "Gumla",
]


@router.get("/districts")
async def list_districts(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Event.district, func.count(Event.id).label("event_count"))
        .where(Event.is_duplicate == False)
        .group_by(Event.district)
    )
    result = await db.execute(stmt)
    counts = {row.district: row.event_count for row in result}

    return [
        {"name": d, "event_count": counts.get(d, 0)}
        for d in JHARKHAND_DISTRICTS
    ]


@router.get("/districts/{district_name}/stats")
async def district_stats(district_name: str, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Event.category, func.count(Event.id).label("count"), func.avg(Event.sentiment).label("avg_sentiment"))
        .where(Event.district == district_name, Event.is_duplicate == False)
        .group_by(Event.category)
    )
    result = await db.execute(stmt)
    rows = result.all()

    by_category = {row.category: row.count for row in rows}
    total = sum(by_category.values())
    sentiment_avg = (
        sum(row.avg_sentiment * row.count for row in rows if row.avg_sentiment) / total
        if total > 0 else 0.0
    )

    return {
        "district": district_name,
        "event_count": total,
        "by_category": by_category,
        "sentiment_avg": round(sentiment_avg, 3),
    }
