import { API_BASE } from "./constants";
import type { IntelEvent, District, DistrictStats, MapFilters } from "./types";

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export async function fetchEvents(filters?: Partial<MapFilters> & { limit?: number; page?: number }): Promise<{ events: IntelEvent[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.categories?.length) params.set("category", filters.categories.join(","));
  if (filters?.districts?.length) params.set("district", filters.districts.join(","));
  if (filters?.confidence_min) params.set("confidence_min", String(filters.confidence_min));
  if (filters?.date_from) params.set("date_from", filters.date_from);
  if (filters?.date_to) params.set("date_to", filters.date_to);
  if (filters?.limit) params.set("limit", String(filters.limit));
  if (filters?.page) params.set("page", String(filters.page));
  return fetchJSON(`/api/v1/events?${params}`);
}

export async function fetchEventById(id: string): Promise<IntelEvent> {
  return fetchJSON(`/api/v1/events/${id}`);
}

export async function fetchDistricts(): Promise<District[]> {
  return fetchJSON("/api/v1/districts");
}

export async function fetchDistrictStats(name: string): Promise<DistrictStats> {
  return fetchJSON(`/api/v1/districts/${encodeURIComponent(name)}/stats`);
}

export async function searchEntities(query: string): Promise<{ events: IntelEvent[]; total: number }> {
  return fetchJSON(`/api/v1/search?q=${encodeURIComponent(query)}`);
}
