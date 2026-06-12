"""
NewsData.io integration service for regional Indian news coverage.
Supports 13 Indian languages and state-level filtering for Jharkhand.
"""

import httpx
import asyncio
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class NewsDataService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://newsdata.io/api/1"
        self.client = httpx.AsyncClient(timeout=30.0)
        
        # Jharkhand-specific parameters
        self.jharkhand_keywords = [
            "Jharkhand", "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro",
            "Deoghar", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar",
            "Chatra", "Koderma", "Latehar", "Simdega", "Khunti",
            "West Singhbhum", "East Singhbhum", "Saraikela",
            "Jharkhand government", "Jharkhand police", "Jharkhand news"
        ]
        
        # Indian languages supported by NewsData.io
        self.indian_languages = [
            "hi", "bn", "ta", "te", "ml", "kn", "gu", "mr", "pa", "or", "as", "ur", "en"
        ]

    async def search_jharkhand_news(
        self, 
        days_back: int = 7,
        max_results: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Search for Jharkhand-related news across multiple Indian languages.
        """
        articles = []
        
        # Search in multiple batches for different language combinations
        search_queries = [
            # English queries
            {
                "q": "Jharkhand OR Ranchi OR Jamshedpur",
                "language": "en",
                "country": "in"
            },
            # Hindi queries
            {
                "q": "झारखंड OR रांची OR जमशेदपुर",
                "language": "hi", 
                "country": "in"
            },
            # Regional language queries
            {
                "q": "Jharkhand news latest updates",
                "language": "en",
                "country": "in"
            }
        ]
        
        for query_params in search_queries:
            try:
                batch_articles = await self._fetch_batch(
                    query=query_params["q"],
                    language=query_params["language"],
                    country=query_params["country"],
                    days_back=days_back,
                    max_results=max_results // len(search_queries)
                )
                articles.extend(batch_articles)
                
                # Rate limiting
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.error(f"Error fetching batch for {query_params}: {e}")
                continue
        
        # Remove duplicates and filter for Jharkhand relevance
        unique_articles = self._deduplicate_articles(articles)
        jharkhand_articles = self._filter_jharkhand_relevant(unique_articles)
        
        return jharkhand_articles[:max_results]

    async def _fetch_batch(
        self,
        query: str,
        language: str,
        country: str,
        days_back: int,
        max_results: int
    ) -> List[Dict[str, Any]]:
        """Fetch a batch of articles from NewsData.io."""
        
        params = {
            "apikey": self.api_key,
            "q": query,
            "language": language,
        }
        
        try:
            response = await self.client.get(f"{self.base_url}/news", params=params)
            response.raise_for_status()
            
            # Handle empty responses
            if not response.text.strip():
                logger.warning("Empty response from NewsData.io")
                return []
            
            try:
                data = response.json()
            except ValueError as e:
                logger.error(f"JSON decode error from NewsData.io: {e}")
                logger.error(f"Response text: {response.text[:500]}")
                return []
            
            if data.get("status") == "success":
                return data.get("results", [])
            else:
                logger.error(f"NewsData.io API error: {data.get('message', 'Unknown error')}")
                return []
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error from NewsData.io: {e.response.status_code} - {e.response.text}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error fetching from NewsData.io: {e}")
            return []

    def _filter_jharkhand_relevant(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Filter articles for Jharkhand relevance using keywords and content analysis."""
        relevant_articles = []
        
        for article in articles:
            title = (article.get("title") or "").lower()
            description = (article.get("description") or "").lower()
            content = (article.get("content") or "").lower()
            
            # Combine all text for analysis
            full_text = f"{title} {description} {content}"
            
            # Check for Jharkhand relevance
            if self._is_jharkhand_relevant(full_text):
                relevant_articles.append(article)
        
        return relevant_articles

    def _is_jharkhand_relevant(self, text: str) -> bool:
        """Check if text is relevant to Jharkhand."""
        text_lower = text.lower()
        
        # Direct keyword matching
        for keyword in self.jharkhand_keywords:
            if keyword.lower() in text_lower:
                return True
        
        # Contextual matching for broader relevance
        contextual_keywords = [
            "state government", "district administration", "police",
            "development project", "industrial", "mining", "forest",
            "tribal", "adivasi", "rural development"
        ]
        
        # If contextual keywords found, check for India/region context
        if any(keyword in text_lower for keyword in contextual_keywords):
            if any(region in text_lower for region in ["india", "bharat", "eastern india"]):
                return True
        
        return False

    def _deduplicate_articles(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate articles based on title and URL."""
        seen_titles = set()
        seen_urls = set()
        unique_articles = []
        
        for article in articles:
            title = article.get("title", "").lower().strip()
            url = article.get("link", "").strip()
            
            if title and title not in seen_titles and url not in seen_urls:
                seen_titles.add(title)
                seen_urls.add(url)
                unique_articles.append(article)
        
        return unique_articles

    def normalize_article(self, article: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize NewsData.io article format to our standard format."""
        return {
            "title": article.get("title", ""),
            "summary": article.get("description") or article.get("content", ""),
            "content": article.get("content", ""),
            "source_url": article.get("link", ""),
            "source_name": article.get("source_id", ""),
            "published_at": self._parse_date(article.get("pubDate")),
            "author": article.get("creator", ""),
            "category": self._extract_category(article),
            "keywords": article.get("keywords", []),
            "language": article.get("language", "en"),
            "country": article.get("country", "in"),
            "image_url": article.get("image_url", "")
        }

    def _parse_date(self, date_str: Optional[str]) -> datetime:
        """Parse date from NewsData.io format."""
        if not date_str:
            return datetime.now(timezone.utc)
        
        try:
            # NewsData.io returns ISO format dates
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except:
            return datetime.now(timezone.utc)

    def _extract_category(self, article: Dict[str, Any]) -> str:
        """Extract category from article keywords and content."""
        keywords = [kw.lower() for kw in article.get("keywords", []) or []]
        title = (article.get("title", "") + " " + article.get("description", "")).lower()
        
        # Category mapping based on keywords
        category_mapping = {
            "crime": ["crime", "police", "arrest", "murder", "theft", "robbery", "violence"],
            "politics": ["politics", "government", "election", "minister", "cm", "chief minister", "bjp", "congress"],
            "accident": ["accident", "road accident", "train accident", "injured", "casualty"],
            "infrastructure": ["road", "bridge", "construction", "development", "project", "infrastructure"],
            "protest": ["protest", "strike", "demonstration", "rally", "agitation"],
            "weather": ["weather", "rain", "flood", "storm", "temperature", "climate"],
            "disaster": ["disaster", "emergency", "rescue", "evacuation", "tragedy"],
            "economy": ["economy", "business", "investment", "industry", "mining", "coal"],
            "education": ["education", "school", "college", "university", "student", "exam"],
            "health": ["health", "hospital", "medical", "doctor", "disease", "treatment"],
            "civic": ["civic", "administration", "municipal", "services", "public"]
        }
        
        for category, keywords_list in category_mapping.items():
            if any(keyword in title or keyword in " ".join(keywords) for keyword in keywords_list):
                return category
        
        return "civic"  # Default category

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()


async def fetch_newsdata_articles(max_results: int = 50) -> List[Dict[str, Any]]:
    """
    Convenience function to fetch Jharkhand news from NewsData.io.
    """
    import os
    
    api_key = os.getenv("NEWSDATA_API_KEY")
    if not api_key:
        logger.warning("NewsData.io API key not provided")
        return []
    
    service = NewsDataService(api_key)
    try:
        articles = await service.search_jharkhand_news(days_back=3, max_results=max_results)
        return [service.normalize_article(article) for article in articles]
    finally:
        await service.close()
