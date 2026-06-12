"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import { useAppStore } from "@/store/useAppStore";
import { JHARKHAND_CENTER, JHARKHAND_ZOOM } from "@/lib/constants";
import EventMarkerLayer from "./EventMarkerLayer";
import DistrictBoundaryLayer from "./DistrictBoundaryLayer";
import HeatmapLayer from "./HeatmapLayer";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

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
  const { heatmapEnabled } = useAppStore();

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
        <DistrictBoundaryLayer />
        {heatmapEnabled && <HeatmapLayer />}
        <MarkerClusterGroup
          chunkedLoading
          spiderfyOnMaxZoom={false}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          maxClusterRadius={60}
          iconCreateFunction={(cluster: L.MarkerCluster) => {
            const count = cluster.getChildCount();
            let size = "small";
            let color = "#00d4ff";
            if (count > 20) {
              size = "large";
              color = "#ffaa00";
            } else if (count > 5) {
              size = "medium";
              color = "#ff6600";
            }
            const radius = size === "large" ? 28 : size === "medium" ? 22 : 18;
            return L.divIcon({
              html: `<div style="
                background: ${color};
                color: #080c10;
                border-radius: 50%;
                width: ${radius * 2}px;
                height: ${radius * 2}px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: ${size === "large" ? "14px" : "12px"};
                font-family: 'Share Tech Mono', monospace;
                box-shadow: 0 0 10px ${color};
              ">${count}</div>`,
              className: "custom-cluster-icon",
              iconSize: [radius * 2, radius * 2],
            });
          }}
        >
          <EventMarkerLayer />
        </MarkerClusterGroup>
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
