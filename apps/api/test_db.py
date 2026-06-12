import asyncio
from app.db.session import AsyncSessionLocal
from app.models.event import Event
from sqlalchemy import select, func

async def test_db():
    """Test database connection and count events."""
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(func.count()).select_from(Event))
            count = result.scalar()
            print(f'Database connection working. Events in DB: {count}')
            
            # Get first few events
            result = await db.execute(select(Event).limit(5))
            events = result.scalars().all()
            print(f'Sample events: {len(events)}')
            for event in events:
                print(f'  - {event.title[:50]}...')
                
    except Exception as e:
        print(f'Database error: {e}')

if __name__ == "__main__":
    asyncio.run(test_db())
