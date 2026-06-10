import uuid
from datetime import datetime
from sqlalchemy import String, Float, Boolean, DateTime, Text, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from app.db.session import Base

CATEGORY_ENUM = SAEnum(
    "crime", "politics", "accident", "infrastructure", "protest",
    "weather", "disaster", "economy", "education", "health", "civic",
    name="event_category",
)


class Event(Base):
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str] = mapped_column(CATEGORY_ENUM, nullable=False, index=True)
    location_name: Mapped[str | None] = mapped_column(Text)
    geom = mapped_column(Geometry("POINT", srid=4326), nullable=True, index=True)
    district: Mapped[str | None] = mapped_column(String(100), index=True)
    source_url: Mapped[str | None] = mapped_column(Text)
    source_name: Mapped[str | None] = mapped_column(String(200))
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    sentiment: Mapped[float | None] = mapped_column(Float)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    is_duplicate: Mapped[bool] = mapped_column(Boolean, default=False)
    cluster_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("event_clusters.id"), nullable=True)
    raw_content: Mapped[str | None] = mapped_column(Text)

    entities: Mapped[list["Entity"]] = relationship("Entity", back_populates="event", cascade="all, delete-orphan")


class Entity(Base):
    __tablename__ = "entities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    entity_text: Mapped[str] = mapped_column(Text, nullable=False)
    entity_type: Mapped[str] = mapped_column(
        SAEnum("PERSON", "LOCATION", "ORG", "DATE", "EVENT", name="entity_type_enum"), nullable=False
    )
    normalized: Mapped[str | None] = mapped_column(Text)

    event: Mapped["Event"] = relationship("Event", back_populates="entities")


class EventCluster(Base):
    __tablename__ = "event_clusters"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    centroid = mapped_column(Geometry("POINT", srid=4326), nullable=True)
    event_count: Mapped[int] = mapped_column(default=0)
    dominant_category: Mapped[str | None] = mapped_column(CATEGORY_ENUM)
    time_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    time_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
