# Setting Up API Keys for Real News Ingestion

## 🚀 Quick Setup Guide

### 1. Get Your API Keys

#### NewsData.io (Recommended for Regional Coverage)
- **Website**: https://newsdata.io/
- **Features**: 13 Indian languages, state-level filtering, 7-year archive
- **Free Plan**: 100 requests/day
- **Sign up**: https://newsdata.io/register
- **Get API Key**: Dashboard → API Key

#### NewsAPI.org (Global Coverage)
- **Website**: https://newsapi.org/
- **Features**: 80,000+ sources, stable API, good documentation
- **Free Plan**: 1,000 requests/day (much better than monthly limits)
- **Sign up**: https://newsapi.org/register
- **Get API Key**: Dashboard → API Keys

#### Google Geocoding API (Optional but Recommended)
- **Website**: https://console.cloud.google.com/
- **Features**: Precise location geocoding for Jharkhand districts
- **Free Tier**: $200/month credit
- **Setup**: 
  1. Create project
  2. Enable "Geocoding API"
  3. Create API key
  4. Restrict key to Geocoding API only

### 2. Configure Environment Variables

Create `apps/api/.env` file:

```bash
# Database Configuration (already configured)
DATABASE_URL=postgresql+asyncpg://jhcmd:jhcmd_dev@localhost:5432/jharkhand_command
REDIS_URL=redis://localhost:6379

# News API Keys (add yours here)
NEWSDATA_API_KEY=your_newsdata_api_key_here
NEWSAPI_ORG_KEY=your_newsapi_org_key_here

# Geocoding Services (optional but recommended)
GOOGLE_GEOCODING_KEY=your_google_geocoding_key_here
```

### 3. Test the Integration

Once you've added the API keys, restart the services:

```bash
# Restart API backend
cd apps/api
.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000

# Restart Celery worker
cd apps/api
.venv\Scripts\Activate.ps1
celery -A app.celery_app worker --loglevel=info --pool=solo
```

### 4. Trigger Manual Ingestion

Test the news ingestion by calling the API endpoint:

```bash
curl -X POST http://localhost:8000/api/v1/ingest/run
```

Or visit: http://localhost:8000/docs and use the "Run Ingestion" endpoint.

### 5. Verify Results

Check the Jharkhand COMMAND platform at http://localhost:3000:
- Map should populate with real news events
- Intel Feed should show recent articles
- Events should be categorized and geolocated

## 🎯 What These APIs Provide

### NewsData.io
- **Regional Focus**: Excellent Jharkhand-specific coverage
- **Language Support**: Hindi, Bengali, Tamil, Telugu, Malayalam, Kannada, Gujarati, Marathi, Punjabi, Oriya, Assamese, Urdu
- **State Filtering**: Can filter by Jharkhand specifically
- **Historical Data**: 7 years of archives

### NewsAPI.org
- **Global Reach**: 80,000+ news sources
- **Stable API**: Reliable service with good documentation
- **Real-time**: Breaking news coverage
- **Better Limits**: 1,000 requests/day vs monthly limits

### Combined Power
- **Comprehensive Coverage**: Both regional and global perspectives
- **Language Diversity**: English + regional languages
- **Deduplication**: Built-in duplicate detection
- **Relevance Scoring**: Intelligent Jharkhand relevance filtering

## 🔧 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify the key is correct
   - Check if you've exceeded rate limits
   - Ensure the key is active

2. **No Articles Appearing**
   - Check API logs: `logs/api.log`
   - Verify environment variables are loaded
   - Test individual API endpoints

3. **Geocoding Failures**
   - Google Geocoding API is optional
   - System falls back to Nominatim (free)
   - Events will still appear without precise coordinates

### Monitoring

Check the API health:
```bash
curl http://localhost:8000/health
```

Check Celery worker status:
```bash
# In the Celery terminal - should show "ready" status
```

## 📊 Expected Results

With proper API keys configured, you should see:
- **10-50 new articles per day** from Jharkhand region
- **Multiple language coverage** (English + regional)
- **Real-time updates** every 5 minutes
- **Categorized events** (crime, politics, infrastructure, etc.)
- **Geolocated incidents** on the map

The platform will transform from a demo to a live intelligence system!
