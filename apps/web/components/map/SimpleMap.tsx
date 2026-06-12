"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useAppStore } from "@/store/useAppStore";
import { JHARKHAND_CENTER, JHARKHAND_ZOOM, CATEGORY_COLORS } from "@/lib/constants";
import DistrictBoundaryLayer from "./DistrictBoundaryLayer";
import HeatmapLayer from "./HeatmapLayer";
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

function SimpleEventMarkers() {
  const { events, selectEvent } = useAppStore();

  const filteredEvents = useMemo(() => {
    return events.filter(event => event.geom?.coordinates);
  }, [events]);

  const createIcon = (category: string) => {
    const color = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || "#00d4ff";
    return L.divIcon({
      html: `<div style="
        width: 12px;
        height: 12px;
        background: ${color};
        border-radius: 50%;
        border: 2px solid #080c10;
        box-shadow: 0 0 10px ${color};
      "></div>`,
      className: "",
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });
  };

  return (
    <>
      {filteredEvents.map((event) => (
        <Marker
          key={event.id}
          position={[event.geom.coordinates[1], event.geom.coordinates[0]]}
          icon={createIcon(event.category)}
          eventHandlers={{
            click: () => selectEvent(event),
          }}
        >
          <Popup>
            <div style={{ fontFamily: "Share Tech Mono, monospace", fontSize: "12px" }}>
              <strong>{event.title}</strong><br />
              <span style={{ color: CATEGORY_COLORS[event.category as keyof typeof CATEGORY_COLORS] }}>
                {event.category.toUpperCase()}
              </span><br />
              {event.location_name && <small>{event.location_name}</small>}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default function SimpleMap() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
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
        <DistrictBoundaryLayer />
        <HeatmapLayer />
        <SimpleEventMarkers />
        <FlyToSelected />
      </MapContainer>
    </div>
  );
}
