"use client";

import { useCallback, useState } from "react";

export type GeneratedRouteResponse = {
  geometry: GeoJSON.LineString;
  distanceMiles: number;
  durationMinutes: number;
};

export function useGeneratedRoute() {
  const [data, setData] = useState<GeneratedRouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRoute = useCallback(
    async (lat: number, lng: number, distanceMiles: number) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/generate-route", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ lat, lng, distanceMiles }),
        });

        if (!response.ok) {
          const errorBody = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          const message =
            errorBody?.error || "Unable to generate a route right now.";
          setError(message);
          setData(null);
          return null;
        }

        const payload = (await response.json()) as GeneratedRouteResponse;
        console.log("useGeneratedRoute received:", payload);
        setData(payload);
        return payload;
      } catch (err) {
        console.error("Failed to generate route:", err);
        setError("Unexpected error. Please try again.");
        setData(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, generateRoute };
}


