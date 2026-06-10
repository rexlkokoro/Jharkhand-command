import { create } from "zustand";
import type { IntelEvent, MapFilters, NavTab, EventCategory } from "@/lib/types";
import { ALL_CATEGORIES } from "@/lib/constants";

interface AppState {
  events: IntelEvent[];
  selectedEvent: IntelEvent | null;
  activeTab: NavTab;
  filters: MapFilters;
  isDrawerOpen: boolean;
  isLive: boolean;

  setEvents: (events: IntelEvent[]) => void;
  addEvent: (event: IntelEvent) => void;
  selectEvent: (event: IntelEvent | null) => void;
  setActiveTab: (tab: NavTab) => void;
  setFilters: (filters: Partial<MapFilters>) => void;
  toggleCategory: (category: EventCategory) => void;
  setDrawerOpen: (open: boolean) => void;
  setLive: (live: boolean) => void;
  clearFilters: () => void;
}

const defaultFilters: MapFilters = {
  categories: ALL_CATEGORIES as EventCategory[],
  districts: [],
  sources: [],
  confidence_min: 0,
};

export const useAppStore = create<AppState>((set, get) => ({
  events: [],
  selectedEvent: null,
  activeTab: "map",
  filters: defaultFilters,
  isDrawerOpen: false,
  isLive: true,

  setEvents: (events) => set({ events }),

  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 500),
    })),

  selectEvent: (event) =>
    set({ selectedEvent: event, isDrawerOpen: event !== null }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  toggleCategory: (category) =>
    set((state) => {
      const current = state.filters.categories;
      const updated = current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category];
      return { filters: { ...state.filters, categories: updated } };
    }),

  setDrawerOpen: (open) => set({ isDrawerOpen: open }),

  setLive: (live) => set({ isLive: live }),

  clearFilters: () => set({ filters: defaultFilters }),
}));
