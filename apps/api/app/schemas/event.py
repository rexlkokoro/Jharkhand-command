from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
import uuid


class GeoPoint(BaseModel):
    type: str = "Point"
    coordinates: List[float]


class EntityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    event_id: uuid.UUID
    entity_text: str
    entity_type: str
    normalized: Optional[str] = None


class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    summary: Optional[str] = None
    category: str
    location_name: Optional[str] = None
    district: Optional[str] = None
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    published_at: datetime
    ingested_at: datetime
    sentiment: Optional[float] = None
    confidence: float
    is_duplicate: bool
    entities: List[EntityOut] = []

    geom: Optional[GeoPoint] = None

    @classmethod
    def model_validate(cls, obj, **kwargs):
        data = {c.key: getattr(obj, c.key) for c in obj.__table__.columns}
        if obj.geom is not None:
            from geoalchemy2.shape import to_shape
            shape = to_shape(obj.geom)
            data["geom"] = {"type": "Point", "coordinates": [shape.x, shape.y]}
        data["entities"] = [EntityOut.model_validate(e) for e in obj.entities]
        return cls(**data)


class EventsResponse(BaseModel):
    events: List[EventOut]
    total: int
    page: int = 1
