import asyncio
import os
import uuid
from datetime import datetime, timezone
from app.db.session import AsyncSessionLocal
from app.models.event import Event

async def simple_ingest_test():
    """Simple test to insert a basic event without NLP or geocoding."""
    print("=== SIMPLE INGESTION TEST ===")
    
    # Set environment variables
    os.environ["NEWSAPI_ORG_KEY"] = "1c3c440c1f934a8c89b8206f52171e3b"
    os.environ["NEWSDATA_API_KEY"] = "pub_dbae09becd814f29bed5020217fecf6c"
    
    async with AsyncSessionLocal() as db:
        # Check current event count
        from sqlalchemy import select, func
        result = await db.execute(select(func.count()).select_from(Event))
        current_count = result.scalar()
        print(f"Current events in database: {current_count}")
        
        # Create a simple test event
        test_event = Event(
            id=uuid.uuid4(),
            title="Test Jharkhand Event - Auto Fare Hike",
            summary="Auto fares hiked by Rs 5 in steel city due to rising fuel costs.",
            category="infrastructure",
            location_name="Jamshedpur",
            geom=None,  # Skip geocoding for now
            district="Jamshedpur",
            source_url="https://test.example.com/auto-fare-hike",
            source_name="Test Source",
            published_at=datetime.now(timezone.utc),
            ingested_at=datetime.now(timezone.utc),
            sentiment=None,
            confidence=0.8,
            is_duplicate=False,
            raw_content="Test content for auto fare hike in Jamshedpur.",
        )
        
        print("Attempting to insert test event...")
        db.add(test_event)
        await db.commit()
        print("✅ Test event inserted successfully!")
        
        # Verify insertion
        result = await db.execute(select(func.count()).select_from(Event))
        new_count = result.scalar()
        print(f"New events in database: {new_count}")
        
        if new_count > current_count:
            print("✅ Database insertion working correctly!")
        else:
            print("❌ Database insertion failed!")
        
        # Query the inserted event
        result = await db.execute(select(Event).where(Event.title.like("%Test Jharkhand Event%")))
        inserted_event = result.scalar_one_or_none()
        if inserted_event:
            print(f"✅ Found inserted event: {inserted_event.title}")
        else:
            print("❌ Could not find inserted event")

if __name__ == "__main__":
    asyncio.run(simple_ingest_test())
