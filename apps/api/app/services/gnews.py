import os
import asyncio
import httpx
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any

GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
GNEWS_URL = "https://gnews.io/api/v4/search"

JHARKHAND_QUERIES = [
    "Jharkhand",
    "Ranchi",
    "Jamshedpur",
    "Dhanbad",
    "Bokaro",
    "Hazaribagh",
]

async def fetch_gnews_articles() -> List[Dict[str, Any]]:
    """
    Fetch articles from GNews.
    Returns a list of dicts ready for ingest pipeline.
    """
    if not GNEWS_API_KEY:
        return []

    articles = []

    async with httpx.AsyncClient(timeout=15) as client:
        for q in JHARKHAND_QUERIES:
            params = {
                "q": q,
                "token": GNEWS_API_KEY,
                "lang": "en,hi",
                "max": 20,
                "from": (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "to": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "sortby": "publishedAt",
            }
            resp = await client.get(GNEWS_URL, params=params)
            data = resp.json()
            for item in data.get("articles", []):
                articles.append(_normalize(item))

    return articles


def _normalize(item: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "title": item.get("title", ""),
        "summary": item.get("description"),
        "url": item.get("url"),
        "source": item.get("source", {}).get("name"),
        "publishedAt": item.get("publishedAt"),
        "content": item.get("content"),
        "category": "civic",  # Phase 4 will classify
        "sentiment": None,     # Phase 4 will compute
        "confidence": 0.75,
        "location": None,
    }
