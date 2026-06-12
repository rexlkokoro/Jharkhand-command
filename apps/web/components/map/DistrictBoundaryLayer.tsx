"use client";

import { useEffect, useState } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import * as L from "leaflet";
import type { Feature, FeatureCollection } from "geojson";

interface DistrictProperties {
  name: string;
}

export default function DistrictBoundaryLayer() {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
  const map = useMap();

  useEffect(() => {
    fetch("/geojson/jharkhand_districts.geojson")
      .then((r) => r.json())
      .then(setGeojson)
      .catch(() => {});
  }, []);

  if (!geojson) return null;

  const style = {
    color: "#00d4ff",
    weight: 1,
    opacity: 0.5,
    fillOpacity: 0.03,
    fillColor: "#00d4ff",
  };

  const onEachFeature = (feature: Feature, layer: L.Layer) => {
    const props = feature.properties as DistrictProperties;
    if (props?.name) {
      layer.bindTooltip(props.name, {
        permanent: false,
        sticky: true,
        direction: "center",
        className: "district-label-tooltip",
      });
    }
  };

  return <GeoJSON data={geojson} style={style} onEachFeature={onEachFeature} />;
}
