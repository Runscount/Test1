"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

const Map = dynamic(
  () => import("react-map-gl/mapbox").then((mod) => mod.default),
  { ssr: false }
);

const Source = dynamic(
  () => import("react-map-gl/mapbox").then((mod) => mod.Source),
  { ssr: false }
);

const Layer = dynamic(
  () => import("react-map-gl/mapbox").then((mod) => mod.Layer),
  { ssr: false }
);

interface GeneratedRouteMapProps {
  geometry: GeoJSON.LineString | null;
}

export default function GeneratedRouteMap({ geometry }: GeneratedRouteMapProps) {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  }, []);

  useEffect(() => {
    if (!geometry || !mapRef.current) return;

    const bounds = new mapboxgl.LngLatBounds();
    geometry.coordinates.forEach(([lng, lat]) => bounds.extend([lng, lat]));

    try {
      mapRef.current.fitBounds(bounds, { padding: 60, duration: 700 });
    } catch (err) {
      console.error("fitBounds failed", err);
    }
  }, [geometry]);

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-xl border border-gray-200">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: -87.6298,
          latitude: 41.8781,
          zoom: 11,
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
      >
        {geometry && (
          <Source id="generated-route" type="geojson" data={geometry}>
            <Layer
              id="generated-route-line"
              type="line"
              paint={{
                "line-color": "#ff007f",
                "line-width": 5,
                "line-opacity": 0.9,
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
}


