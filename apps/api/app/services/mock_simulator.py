"""
Mock feed simulator — generates realistic fake Jharkhand events for dev.
Run via: python -m app.services.mock_simulator
No real API keys required.
"""
import asyncio
import json
import random
import uuid
from datetime import datetime, timezone

from app.services.broadcaster import broadcaster

CATEGORIES = [
    "crime", "politics", "accident", "infrastructure", "protest",
    "weather", "disaster", "economy", "education", "health", "civic",
]

DISTRICTS = [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh",
    "Deoghar", "Giridih", "Dumka", "Chaibasa", "Palamu",
    "Garhwa", "Lohardaga", "Simdega", "Chatra", "Koderma",
    "Ramgarh", "Khunti", "Saraikela", "Godda", "Sahebganj",
    "Pakur", "Jamtara", "Latehar", "Gumla",
]

# Approximate bounding box for Jharkhand
LAT_RANGE = (22.0, 25.5)
LNG_RANGE = (83.3, 87.5)

MOCK_TITLES = {
    "crime": [
        "Robbery reported near {location} market area",
        "Police arrest two suspects in {district} theft case",
        "Car snatching incident reported in {location}",
        "Cybercrime unit busts fraud ring in {district}",
    ],
    "politics": [
        "CM reviews development projects in {district}",
        "MLA inaugurates new road in {location}",
        "Opposition protests outside {district} collectorate",
        "JMM holds rally at {location} ground",
    ],
    "accident": [
        "Truck overturns on NH-33 near {location}",
        "Road accident in {district} injures {n} persons",
        "Coal mine accident reported at {location}",
        "Bridge collapse scare in {district}",
    ],
    "infrastructure": [
        "New water supply project inaugurated in {district}",
        "Road widening work begins in {location}",
        "Power outage affects {district} for several hours",
        "Fiber optic network expansion reaches {location}",
    ],
    "protest": [
        "Farmers block NH near {location} over demands",
        "Students protest outside {district} collectorate",
        "Workers strike at {location} industrial estate",
        "Tribals demonstrate in {district} over land rights",
    ],
    "weather": [
        "Heavy rainfall alert issued for {district}",
        "Strong winds damage structures in {location}",
        "Drought conditions worsen in {district} villages",
        "Heatwave warning for {district} region",
    ],
    "disaster": [
        "Flash flood warning for {district} riverbanks",
        "Landslide blocks road in hilly {location} area",
        "Forest fire reported near {location}",
        "Dam overflow alert issued for {district}",
    ],
    "economy": [
        "New industry to set up plant in {district}",
        "MSME fair inaugurated in {location}",
        "Jharkhand exports up 12% this quarter per {district} data",
        "Job fair organized at {location} for 500 posts",
    ],
    "education": [
        "New school building inaugurated in {district}",
        "Scholarship scheme launched for {district} students",
        "Exam results declared for {location} district schools",
        "Mid-day meal irregularities reported in {district}",
    ],
    "health": [
        "Dengue cases rise in {district}, alert issued",
        "Mobile health camp organized in {location}",
        "New PHC inaugurated in {district} block",
        "Vaccination drive covers {n}k residents in {district}",
    ],
    "civic": [
        "Water supply disruption in {location} area",
        "Garbage collection issue reported in {district} ward",
        "Stray animal menace troubles {location} residents",
        "Road pothole complaint from {district} residents",
    ],
}

SUMMARIES = {
    "crime": "Law enforcement responded to an incident in the {district} area. Authorities are investigating the matter and have urged residents to remain vigilant.",
    "politics": "Political activity in {district} today as leaders engaged with local constituents. The event drew significant public attention.",
    "accident": "An accident was reported in {district}, with emergency services responding promptly. Affected individuals have been taken to nearby medical facilities.",
    "infrastructure": "Infrastructure development activity in {district} is progressing as part of ongoing government initiatives to improve civic amenities.",
    "protest": "Demonstrators gathered in {district} to voice grievances. Security forces maintained a peaceful presence. Talks with authorities are expected.",
    "weather": "Meteorological conditions in {district} are being closely monitored. Residents have been advised to take necessary precautions.",
    "disaster": "Emergency authorities have been alerted to a developing situation in {district}. Relief teams are on standby.",
    "economy": "Economic developments in {district} signal growing investment interest in the region.",
    "education": "Educational developments in {district} as authorities focus on improving access and quality of schooling.",
    "health": "Health authorities in {district} are monitoring the situation and have deployed medical teams to address the issue.",
    "civic": "Civic authorities in {district} have been notified and are working to resolve the reported issue.",
}


def make_event(category: str | None = None) -> dict:
    cat = category or random.choice(CATEGORIES)
    district = random.choice(DISTRICTS)
    lat = round(random.uniform(*LAT_RANGE), 6)
    lng = round(random.uniform(*LNG_RANGE), 6)
    n = random.randint(2, 15)

    title_template = random.choice(MOCK_TITLES[cat])
    title = title_template.format(location=f"{district} area", district=district, n=n)

    summary = SUMMARIES[cat].format(district=district)

    return {
        "id": str(uuid.uuid4()),
        "title": title,
        "summary": summary,
        "category": cat,
        "location_name": f"{district}, Jharkhand",
        "geom": {"type": "Point", "coordinates": [lng, lat]},
        "district": district,
        "source_url": "http://mock.jharkhand-command.dev/article/" + str(uuid.uuid4())[:8],
        "source_name": random.choice(["MockFeed", "SimPress", "DevSource"]),
        "published_at": datetime.now(timezone.utc).isoformat(),
        "ingested_at": datetime.now(timezone.utc).isoformat(),
        "sentiment": round(random.uniform(-0.8, 0.8), 3),
        "confidence": round(random.uniform(0.55, 0.98), 3),
        "is_duplicate": False,
        "entities": [
            {
                "id": str(uuid.uuid4()),
                "event_id": "mock",
                "entity_text": district,
                "entity_type": "LOCATION",
                "normalized": district,
            }
        ],
    }


async def run_simulator(interval_seconds: float = 4.0):
    """Publish a mock event to Redis PubSub every `interval_seconds`."""
    print(f"[MockSimulator] Starting — emitting events every {interval_seconds}s")
    while True:
        event = make_event()
        await broadcaster.publish(event)
        print(f"[MockSimulator] Published: [{event['category'].upper()}] {event['title']}")
        await asyncio.sleep(interval_seconds)


if __name__ == "__main__":
    asyncio.run(run_simulator())
