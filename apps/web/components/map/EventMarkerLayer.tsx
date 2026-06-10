"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useAppStore } from "@/store/useAppStore";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";
import type { IntelEvent } from "@/lib/types";

function createGlowIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        position:relative;
        width:12px;
        height:12px;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <div style="
          width:10px;
          height:10px;
          border-radius:50%;
          background:${color};
          box-shadow:0 0 10px ${color}, 0 0 20px ${color}44;
          animation:marker-pulse 3s ease-in-out infinite;
          position:relative;
          z-index:2;
        "></div>
        <div style="
          position:absolute;
          inset:-6px;
          border-radius:50%;
          border:1px solid ${color};
          opacity:0.3;
          animation:ring-expand 3s ease-out infinite;
        "></div>
      </div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -10],
  });
}

export default function EventMarkerLayer() {
  const map = useMap();
  const { events, filters, selectEvent } = useAppStore();
  const layerRef = useRef<L.LayerGroup | null>(null);

  const filteredEvents = events.filter((e) => {
    if (!filters.categories.includes(e.category)) return false;
    if (filters.districts.length > 0 && !filters.districts.includes(e.district)) return false;
    if (e.confidence < filters.confidence_min) return false;
    return true;
  });

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }
    const layer = L.layerGroup();

    filteredEvents.forEach((event: IntelEvent) => {
      if (!event.geom?.coordinates) return;
      const [lng, lat] = event.geom.coordinates;
      const color = CATEGORY_COLORS[event.category] ?? "#7a9ab8";
      const icon = createGlowIcon(color);

      const marker = L.marker([lat, lng], { icon });

      const timeStr = new Date(event.published_at).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      marker.bindTooltip(
        `<div style="
          background:#0a0f16;
          border:1px solid #1a2535;
          padding:6px 10px;
          font-family:'Share Tech Mono',monospace;
          font-size:10px;
          color:#c8d8e8;
          max-width:200px;
          line-height:1.5;
        ">
          <div style="color:${color};font-size:9px;letter-spacing:0.1em;margin-bottom:4px;">
            ${CATEGORY_LABELS[event.category] ?? event.category.toUpperCase()} · ${event.district}
          </div>
          <div>${event.title}</div>
          <div style="color:#4a6480;font-size:9px;margin-top:4px;">${timeStr}</div>
        </div>`,
        {
          permanent: false,
          direction: "top",
          className: "leaflet-custom-tooltip",
          opacity: 1,
        }
      );

      marker.on("click", () => selectEvent(event));
      layer.addLayer(marker);
    });

    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) map.removeLayer(layerRef.current);
    };
  }, [filteredEvents, map, selectEvent]);

  return null;
}
