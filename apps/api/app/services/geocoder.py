import os
import asyncio
import httpx
from shapely.geometry import Point
from geoalchemy2.shape import from_shape

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
GOOGLE_API_URL = "https://maps.googleapis.com/maps/api/geocode/json"

async def geocode_location(query: str):
    """
    Geocode a location string.
    1) Try Nominatim (OSM) — no API key needed.
    2) If no result and GOOGLE_GEOCODING_KEY is set, fall back to Google.
    Returns a PostGIS Point or None.
    """
    # 1) Nominatim
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(NOMINATIM_URL, params={
            "q": query,
            "format": "json",
            "limit": 1,
            "countrycodes": "in",
            "addressdetails": 1,
        })
        data = resp.json()
        if data:
            lon, lat = float(data[0]["lon"]), float(data[0]["lat"])
            point = Point(lon, lat)
            return from_shape(point, srid=4326)

    # 2) Google fallback
    google_key = os.getenv("GOOGLE_GEOCODING_KEY")
    if not google_key:
        return None

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(GOOGLE_API_URL, params={
            "address": query,
            "key": google_key,
            "components": "country:IN",
        })
        data = resp.json()
        if data.get("results"):
            loc = data["results"][0]["geometry"]["location"]
            point = Point(loc["lng"], loc["lat"])
            return from_shape(point, srid=4326)

    return None
