export type EventCategory =
  | "crime"
  | "politics"
  | "accident"
  | "infrastructure"
  | "protest"
  | "weather"
  | "disaster"
  | "economy"
  | "education"
  | "health"
  | "civic";

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface IntelEvent {
  id: string;
  title: string;
  summary: string;
  category: EventCategory;
  location_name: string;
  geom: GeoPoint;
  district: string;
  source_url: string;
  source_name: string;
  published_at: string;
  ingested_at: string;
  sentiment: number;
  confidence: number;
  is_duplicate: boolean;
  entities?: Entity[];
}

export interface Entity {
  id: string;
  event_id: string;
  entity_text: string;
  entity_type: "PERSON" | "LOCATION" | "ORG" | "DATE" | "EVENT";
  normalized: string;
}

export interface District {
  id: string;
  name: string;
  population: number;
  hq_city: string;
  event_count?: number;
}

export interface DistrictStats {
  district: string;
  event_count: number;
  by_category: Record<EventCategory, number>;
  sentiment_avg: number;
  top_entities: string[];
}

export type NavTab = "map" | "analytics" | "search" | "timeline";

export interface MapFilters {
  categories: EventCategory[];
  districts: string[];
  sources: string[];
  confidence_min: number;
  date_from?: string;
  date_to?: string;
  searchQuery?: string;
}
