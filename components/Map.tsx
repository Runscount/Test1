"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Route } from "@/types/route";

interface MapProps {
  routes: Route[];
  selectedRouteId?: string | null;
  onRouteClick?: (routeId: string) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
  generatedRouteGeometry?: GeoJSON.LineString | null;
}

export function Map({
  routes,
  selectedRouteId,
  onRouteClick,
  center = [-87.6298, 41.8781], // Default to Chicago
  zoom = 11,
  className = "h-full w-full",
  generatedRouteGeometry,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error(
        "NEXT_PUBLIC_MAPBOX_TOKEN is not set. Please add it to your .env.local file."
      );
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: center,
      zoom: zoom,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom]);

  // Add routes to map
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const mapInstance = map.current;

    if (!mapInstance.isStyleLoaded()) {
      return;
    }

    // In some dev/StrictMode scenarios the Mapbox style may not be fully
    // loaded yet even after the "load" event. Guard against that case to
    // avoid the \"Style is not done loading\" runtime error.
    if (!mapInstance.isStyleLoaded()) {
      return;
    }

    // Remove existing sources and layers
    routes.forEach((route) => {
      const sourceId = `route-${route.id}`;
      const layerId = `route-layer-${route.id}`;

      if (mapInstance.getLayer(layerId)) {
        mapInstance.removeLayer(layerId);
      }
      if (mapInstance.getSource(sourceId)) {
        mapInstance.removeSource(sourceId);
      }
    });

    // Add each route as a GeoJSON source and layer
    routes.forEach((route) => {
      const sourceId = `route-${route.id}`;
      const layerId = `route-layer-${route.id}`;
      const isSelected = selectedRouteId === route.id;

      mapInstance.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: route.geojson,
          properties: { id: route.id, name: route.name },
        },
      });

      mapInstance.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": isSelected ? "#3b82f6" : "#10b981",
          "line-width": isSelected ? 5 : 3,
          "line-opacity": isSelected ? 1 : 0.7,
        },
      });

      // Make routes clickable
      mapInstance.on("click", layerId, (e) => {
        if (onRouteClick && e.features?.[0]?.properties?.id) {
          onRouteClick(e.features[0].properties.id);
        }
      });

      // Change cursor on hover
      mapInstance.on("mouseenter", layerId, () => {
        mapInstance.getCanvas().style.cursor = "pointer";
      });
      mapInstance.on("mouseleave", layerId, () => {
        mapInstance.getCanvas().style.cursor = "";
      });
    });

    // Fit map to show all routes if multiple routes
    if (routes.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      routes.forEach((route) => {
        route.geojson.coordinates.forEach((coord) => {
          bounds.extend(coord as [number, number]);
        });
      });
      if (!bounds.isEmpty()) {
        mapInstance.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 14,
        });
      }
    }
  }, [routes, selectedRouteId, mapLoaded, onRouteClick]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const mapInstance = map.current;

    if (!mapInstance.isStyleLoaded()) {
      return;
    }

    const lineSourceId = "generated-route";
    const lineLayerId = "generated-route-layer";
    const pointsLayerId = "generated-route-points-layer";

    if (mapInstance.getLayer(lineLayerId)) {
      mapInstance.removeLayer(lineLayerId);
    }
    if (mapInstance.getLayer(pointsLayerId)) {
      mapInstance.removeLayer(pointsLayerId);
    }
    if (mapInstance.getSource(lineSourceId)) {
      mapInstance.removeSource(lineSourceId);
    }

    if (!generatedRouteGeometry) {
      console.log("No generatedRouteGeometry available");
      return;
    }

    console.log("Drawing generatedRouteGeometry:", generatedRouteGeometry);

    mapInstance.addSource(lineSourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: generatedRouteGeometry,
        properties: {},
      },
    });

    mapInstance.addLayer({
      id: lineLayerId,
      type: "line",
      source: lineSourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#ec4899",
        "line-width": 5,
        "line-opacity": 0.9,
      },
    });

    mapInstance.addLayer({
      id: pointsLayerId,
      type: "circle",
      source: lineSourceId,
      paint: {
        "circle-radius": 4,
        "circle-color": "#1d4ed8",
      },
    });

    const bounds = new mapboxgl.LngLatBounds();
    generatedRouteGeometry.coordinates.forEach(([lng, lat]) =>
      bounds.extend([lng, lat])
    );
    if (!bounds.isEmpty()) {
      mapInstance.fitBounds(bounds, {
        padding: 40,
        duration: 0,
      });
    }
  }, [generatedRouteGeometry, mapLoaded]);

  return (
    <div className={className} ref={mapContainer}>
      {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
        <div className="flex h-full items-center justify-center bg-gray-100 text-gray-600">
          <div className="text-center">
            <p className="mb-2 font-semibold">Mapbox token not configured</p>
            <p className="text-sm">
              Please set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local file
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

