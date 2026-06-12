"use client";

import { useEffect, useMemo } from "react";
import { useMap } from "react-leaflet";
import { useAppStore } from "@/store/useAppStore";
import * as L from "leaflet";

// Import Leaflet.heat plugin via CDN (will be loaded dynamically)
declare global {
  interface Window {
    Heatmap: any;
  }
}

export default function HeatmapLayer() {
  const map = useMap();
  const { events, filters } = useAppStore();

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (!event.geom?.coordinates) return false;
      if (filters.categories.length && !filters.categories.includes(event.category)) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          event.title.toLowerCase().includes(query) ||
          (event.summary && event.summary.toLowerCase().includes(query)) ||
          event.location_name.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [events, filters]);

  useEffect(() => {
    // Load Leaflet.heat plugin dynamically
    if (!window.Heatmap) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js";
      script.async = true;
      script.onload = () => {
        createHeatmap();
      };
      document.head.appendChild(script);
    } else {
      createHeatmap();
    }

    function createHeatmap() {
      if (!window.Heatmap || filteredEvents.length === 0) return;

      // Remove existing heatmap layer if any
      map.eachLayer((layer) => {
        if ((layer as any)._heat) {
          map.removeLayer(layer);
        }
      });

      // Prepare heatmap data
      const heatData = filteredEvents.map((event) => {
        const [lng, lat] = event.geom.coordinates;
        // Intensity based on confidence and recency
        const daysSince = (Date.now() - new Date(event.published_at).getTime()) / (1000 * 60 * 60 * 24);
        const recencyFactor = Math.max(0.1, 1 - daysSince / 30); // Decay over 30 days
        const intensity = (event.confidence || 0.5) * recencyFactor;
        return [lat, lng, intensity];
      });

      if (heatData.length === 0) return;

      // Create heatmap layer
      const heat = (window.Heatmap as any).heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1.0,
        gradient: {
          0.0: "#00d4ff", // cyan (low)
          0.3: "#00ff88", // green
          0.6: "#ffaa00", // orange
          1.0: "#ff0044", // red (high)
        },
      });

      map.addLayer(heat);
    }

    return () => {
      // Cleanup heatmap layer on unmount
      map.eachLayer((layer) => {
        if ((layer as any)._heat) {
          map.removeLayer(layer);
        }
      });
    };
  }, [map, filteredEvents]);

  return null;
}
