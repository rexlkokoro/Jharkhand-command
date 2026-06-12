import os
import asyncio
import httpx
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any

NEWSAPI_KEY = os.getenv("NEWSAPI_ORG_KEY")
NEWSAPI_URL = "https://newsapi.org/v2/everything"

CATEGORIES = ["crime", "politics", "accident", "infrastructure", "protest", "disaster", "economy", "education", "health", "civic"]
JHARKHAND_QUERIES = [
    "Jharkhand OR Ranchi OR Jamshedpur OR Dhanbad OR Bokaro OR Hazaribagh",
    "Jharkhand AND (mine OR coal OR steel)",
    "Jharkhand AND (tribal OR adivasi)",
    "Jharkhand AND (protest OR strike)",
]

async def fetch_newsapi_articles() -> List[Dict[str, Any]]:
    """
    Fetch articles from NewsAPI.
    Returns a list of dicts ready for ingest pipeline.
    """
    if not NEWSAPI_KEY:
        return []

    articles = []

    async with httpx.AsyncClient(timeout=15) as client:
        for query in JHARKHAND_QUERIES:
            params = {
                "q": query,
                "apiKey": NEWSAPI_KEY,
                "language": "en,hi",
                "sortBy": "publishedAt",
                "pageSize": 50,
                "from": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat(),
                "to": datetime.now(timezone.utc).isoformat(),
            }
            resp = await client.get(NEWSAPI_URL, params=params)
            data = resp.json()
            for item in data.get("articles", []):
                articles.append(_normalize(item))

    return articles


def _normalize(item: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "title": item["title"] or "",
        "summary": item.get("description"),
        "url": item.get("url"),
        "source": item.get("source", {}).get("name"),
        "publishedAt": item.get("publishedAt"),
        "content": item.get("content"),
        "category": "civic",  # Phase 4 will classify
        "sentiment": None,     # Phase 4 will compute
        "confidence": 0.8,
        "location": None,
    }
