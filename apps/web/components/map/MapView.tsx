"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { useAppStore } from "@/store/useAppStore";
import { JHARKHAND_CENTER, JHARKHAND_ZOOM } from "@/lib/constants";
import EventMarkerLayer from "./EventMarkerLayer";
import "leaflet/dist/leaflet.css";

function FlyToSelected() {
  const map = useMap();
  const { selectedEvent } = useAppStore();

  useEffect(() => {
    if (selectedEvent?.geom?.coordinates) {
      const [lng, lat] = selectedEvent.geom.coordinates;
      map.flyTo([lat, lng], 13, { duration: 1.2 });
    }
  }, [selectedEvent, map]);

  return null;
}

export default function MapView() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <MapContainer
        center={JHARKHAND_CENTER}
        zoom={JHARKHAND_ZOOM}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />
        <EventMarkerLayer />
        <FlyToSelected />
      </MapContainer>

      {/* Coord readout overlay */}
      <div
        style={{
          position: "absolute",
          bottom: "8px",
          left: "8px",
          zIndex: 1000,
          fontFamily: "Share Tech Mono, monospace",
          fontSize: "9px",
          color: "var(--text-dim)",
          background: "rgba(8,12,16,0.8)",
          border: "1px solid var(--border)",
          padding: "4px 10px",
          letterSpacing: "0.12em",
          pointerEvents: "none",
        }}
      >
        JHARKHAND · 24 DISTRICTS · GEOSPATIAL LAYER ACTIVE
      </div>
    </div>
  );
}
