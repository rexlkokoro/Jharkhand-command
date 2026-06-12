import asyncio
import httpx
import feedparser
from datetime import datetime, timezone
from typing import List, Dict, Any

RSS_SOURCES = [
    {
        "name": "Prabhat Khabar",
        "url": "https://www.prabhatkhabar.com/rss/jharkhand.xml",
        "category": "civic",
    },
    {
        "name": "Jagran Jharkhand",
        "url": "https://www.jagran.com/rss/jharkhand.xml",
        "category": "civic",
    },
    {
        "name": "NDMA Alerts",
        "url": "https://ndma.gov.in/en/alerts.xml",
        "category": "disaster",
    },
    {
        "name": "Jharkhand Govt Press",
        "url": "https://jharkhand.gov.in/rss/press-releases.xml",
        "category": "politics",
    },
]

async def fetch_rss_articles() -> List[Dict[str, Any]]:
    """
    Fetch articles from RSS feeds.
    Returns a list of dicts ready for ingest pipeline.
    """
    articles = []

    async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
        tasks = [_fetch_feed(client, src) for src in RSS_SOURCES]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for res in results:
            if isinstance(res, list):
                articles.extend(res)

    return articles


async def _fetch_feed(client: httpx.AsyncClient, source: Dict[str, Any]) -> List[Dict[str, Any]]:
    try:
        resp = await client.get(source["url"])
        resp.raise_for_status()
        raw = resp.content
        feed = feedparser.parse(raw)
        entries = feed.entries[:30]  # limit to recent 30
        normalized = [_normalize(entry, source) for entry in entries]
        return normalized
    except Exception as e:
        print(f"[RSS] Failed to fetch {source['name']}: {e}")
        return []


def _normalize(entry: Any, source: Dict[str, Any]) -> Dict[str, Any]:
    published = entry.get("published")
    if published:
        try:
            published_dt = datetime.strptime(published, "%a, %d %b %Y %H:%M:%S %Z")
        except Exception:
            try:
                published_dt = datetime.fromisoformat(published)
            except Exception:
                published_dt = datetime.now(timezone.utc)
    else:
        published_dt = datetime.now(timezone.utc)

    return {
        "title": entry.get("title", ""),
        "summary": entry.get("summary"),
        "url": entry.get("link"),
        "source": source["name"],
        "publishedAt": published_dt.isoformat(),
        "content": entry.get("description"),
        "category": source["category"],
        "sentiment": None,
        "confidence": 0.65,
        "location": None,
    }
