import asyncio
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any

from celery import current_app
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.celery_app import celery_app
from app.db.session import AsyncSessionLocal
from app.models.event import Event, Entity
from app.services.newsapi import fetch_newsapi_articles
from app.services.gnews import fetch_gnews_articles
from app.services.newsdata import fetch_newsdata_articles
from app.services.rss_crawler import fetch_rss_articles
from app.services.relevance import is_jharkhand_relevant
from app.services.geocoder import geocode_location
from app.services.broadcaster import broadcaster

# Import NLP pipeline (temporarily disabled)
# import sys
# import os
# nlp_path = os.path.join(os.path.dirname(__file__), "../../..", "packages", "nlp")
# sys.path.append(nlp_path)
# from score_ensemble import enrich_event

def enrich_event(event_data):
    """Temporary placeholder for NLP enrichment"""
    return event_data


@celery_app.task(bind=True, name="app.tasks.ingest.run_all_sources")
def run_all_sources(self):
    """Orchestrates all ingestion sources and persists relevant events."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(_run_all_sources_async())
    finally:
        loop.close()


async def _run_all_sources_async():
    async with AsyncSessionLocal() as db:
        # 1. Fetch from all sources
        articles = []
        articles.extend(await fetch_newsdata_articles())
        articles.extend(await fetch_newsapi_articles())
        articles.extend(await fetch_gnews_articles())
        articles.extend(await fetch_rss_articles())

        # 2. Filter for Jharkhand relevance
        relevant = [a for a in articles if is_jharkhand_relevant(a["title"] + " " + (a.get("summary") or ""))]

        # 3. Dedupe by URL (simple)
        seen_urls = set()
        deduped = []
        for a in relevant:
            url = a.get("source_url") or a.get("url")
            if url and url not in seen_urls:
                seen_urls.add(url)
                deduped.append(a)

        # 4. Persist and broadcast
        for article in deduped:
            await persist_and_broadcast(db, article)


async def persist_and_broadcast(db: AsyncSession, article: Dict[str, Any]):
    # Check if already exists by URL
    source_url = article.get("source_url") or article.get("url")
    if source_url:
        existing = await db.execute(
            select(Event).where(Event.source_url == source_url)
        )
        if existing.scalar_one_or_none():
            return  # already ingested

    # Enrich with NLP pipeline
    try:
        enriched = enrich_event(article)
    except Exception as e:
        # Fallback: use original article if NLP fails
        print(f"[NLP] Enrichment failed: {e}")
        enriched = article.copy()
        enriched["category"] = article.get("category", "civic")
        enriched["sentiment"] = None
        enriched["confidence"] = 0.5
        enriched["entities"] = []

    # Geocode location
    location_name = enriched.get("location") or enriched.get("source") or "Jharkhand"
    geom = await geocode_location(location_name)

    # Infer district from location_name (simple fallback)
    district = None
    for d in [
        "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh",
        "Deoghar", "Giridih", "Dumka", "Chaibasa", "Palamu",
        "Garhwa", "Lohardaga", "Simdega", "Chatra", "Koderma",
        "Ramgarh", "Khunti", "Saraikela", "Godda", "Sahebganj",
        "Pakur", "Jamtara", "Latehar", "Gumla",
    ]:
        if d.lower() in location_name.lower():
            district = d
            break

    # Create event record with NLP outputs
    event = Event(
        id=uuid.uuid4(),
        title=enriched["title"],
        summary=enriched.get("summary"),
        category=enriched["category"],
        location_name=location_name,
        geom=geom,
        district=district,
        source_url=source_url,
        source_name=enriched.get("source"),
        published_at=datetime.fromisoformat(enriched["publishedAt"]),
        ingested_at=datetime.now(timezone.utc),
        sentiment=enriched.get("sentiment"),
        confidence=enriched.get("confidence", 0.7),
        is_duplicate=False,
        raw_content=enriched.get("content"),
    )
    db.add(event)
    await db.flush()

    # Add entities
    for ent in enriched.get("entities", []):
        entity = Entity(
            id=uuid.uuid4(),
            event_id=event.id,
            entity_type=ent["label"],
            entity_text=ent["text"],
            normalized=ent.get("normalized"),
        )
        db.add(entity)

    await db.commit()

    # Broadcast to WebSocket
    event_dict = {
        "id": str(event.id),
        "title": event.title,
        "summary": event.summary,
        "category": event.category,
        "location_name": event.location_name,
        "district": event.district,
        "source_url": event.source_url,
        "source_name": event.source_name,
        "published_at": event.published_at.isoformat(),
        "ingested_at": event.ingested_at.isoformat(),
        "sentiment": event.sentiment,
        "confidence": event.confidence,
        "is_duplicate": event.is_duplicate,
        "entities": [
            {"label": e.entity_type, "text": e.entity_text, "normalized": e.normalized}
            for e in event.entities
        ],
        "geom": {"type": "Point", "coordinates": [geom.x, geom.y]} if geom else None,
    }
    await broadcaster.publish(event_dict)
