import asyncio
import os
from app.services.newsdata import fetch_newsdata_articles
from app.services.relevance import is_jharkhand_relevant

async def debug_ingestion():
    print("=== DEBUGGING INGESTION PIPELINE ===")
    
    # Set environment variables
    os.environ["NEWSAPI_ORG_KEY"] = "1c3c440c1f934a8c89b8206f52171e3b"
    os.environ["NEWSDATA_API_KEY"] = "pub_dbae09becd814f29bed5020217fecf6c"
    
    # 1. Fetch articles
    print("1. Fetching articles...")
    articles = await fetch_newsdata_articles()
    print(f"   Total articles fetched: {len(articles)}")
    
    if not articles:
        print("   No articles found!")
        return
    
    # 2. Show sample article
    print("2. Sample article:")
    sample = articles[0]
    print(f"   Title: {sample.get('title', '')[:100]}...")
    print(f"   Summary: {sample.get('summary', '')[:100]}...")
    print(f"   URL: {sample.get('source_url', '')}")
    
    # 3. Test relevance filtering
    print("3. Testing relevance filtering...")
    text_to_check = sample.get('title', '') + ' ' + (sample.get('summary') or '')
    print(f"   Checking text: {text_to_check[:200]}...")
    
    is_relevant = is_jharkhand_relevant(text_to_check)
    print(f"   Is Jharkhand relevant: {is_relevant}")
    
    # 4. Check all articles
    print("4. Checking all articles for relevance...")
    relevant_count = 0
    for i, article in enumerate(articles):
        text = article.get('title', '') + ' ' + (article.get('summary') or '')
        if is_jharkhand_relevant(text):
            relevant_count += 1
            print(f"   Article {i+1} is relevant: {article.get('title', '')[:80]}...")
    
    print(f"   Total relevant articles: {relevant_count}/{len(articles)}")
    
    # 5. Check URL field (needed for deduplication)
    print("5. Checking URL fields...")
    articles_with_url = [a for a in articles if a.get('source_url')]
    print(f"   Articles with URLs: {len(articles_with_url)}/{len(articles)}")
    
    # 6. Test database insertion
    print("6. Testing database insertion...")
    from app.db.session import AsyncSessionLocal
    from app.models.event import Event
    from sqlalchemy import select, func
    
    async with AsyncSessionLocal() as db:
        # Check current event count
        result = await db.execute(select(func.count()).select_from(Event))
        current_count = result.scalar()
        print(f"   Current events in database: {current_count}")
        
        # Try to insert one relevant article
        relevant_articles = [a for a in articles if is_jharkhand_relevant(a.get('title', '') + ' ' + (a.get('summary') or ''))]
        if relevant_articles:
            test_article = relevant_articles[0]
            print(f"   Attempting to insert: {test_article.get('title', '')[:80]}...")
            
            # Check if already exists
            existing = await db.execute(
                select(Event).where(Event.source_url == test_article.get('source_url'))
            )
            if existing.scalar_one_or_none():
                print("   Article already exists in database")
            else:
                print("   Article is new, would be inserted")

if __name__ == "__main__":
    asyncio.run(debug_ingestion())
