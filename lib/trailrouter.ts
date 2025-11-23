import type { Route } from "@/types/route";
import type { RecommendationPreferences } from "./recommendation";

export interface TrailRouterOptions {
  userLat: number;
  userLng: number;
  targetDistanceMiles: number;
  numCandidates?: number; // default 6
  routeType?: "loop" | "out-and-back";
  preferences?: RecommendationPreferences; // Optional preferences to map to TrailRouter params
}

/**
 * Generate candidate running routes using TrailRouter API
 * 
 * Uses the official TrailRouter endpoint: https://trailrouter.com/ors/experimentalroutes
 * The base URL must be set exactly as: https://trailrouter.com/ors/experimentalroutes
 * 
 * TrailRouter API parameters:
 * - coordinates: "lng,lat" (longitude first!)
 * - roundtrip: true/false (true for loop, false for out-and-back)
 * - target_distance: meters (not km!)
 * - green_preference: 0..1 (maps from scenic preference)
 * - hills_preference: -1..1 (-1 = avoid hills, 0 = neutral, 1 = prefer hills)
 * - avoid_unlit_streets: true/false (maps from nightMode)
 * - avoid_unsafe_streets: true/false (maps from safety preference)
 * - avoid_repetition: true/false
 */
export async function generateTrailRouterCandidates(
  options: TrailRouterOptions
): Promise<Route[]> {
  const {
    userLat,
    userLng,
    targetDistanceMiles,
    numCandidates = 6,
    routeType = "loop",
    preferences,
  } = options;

  const baseUrl = process.env.TRAILROUTER_API_BASE;
  if (!baseUrl) {
    console.warn(
      "TRAILROUTER_API_BASE not configured. Skipping TrailRouter route generation."
    );
    return [];
  }

  // IMPORTANT: Use baseUrl exactly as-is, NO additional path segments
  // Expected: https://trailrouter.com/ors/experimentalroutes
  // DO NOT append /route, /api, or any other path

  const apiKey = process.env.TRAILROUTER_API_KEY;
  const distanceMeters = targetDistanceMiles * 1609.34; // Convert miles to meters

  // Map internal preferences to TrailRouter parameters
  const greenPreference = preferences?.scenicWeight ?? 0.3; // Default 0.3 (30% scenic)
  const hillsPreference = preferences?.preferHills === undefined 
    ? 0 
    : preferences.preferHills 
    ? 0.7 
    : -0.7; // Map to -1..1 range
  const avoidUnlitStreets = preferences?.nightMode ?? false;
  const avoidUnsafeStreets = (preferences?.safetyWeight ?? 0.3) > 0.5; // Higher safety weight = avoid unsafe

  const candidates: Route[] = [];

  // Generate multiple candidate requests with varied distances (±10-20%)
  for (let i = 0; i < numCandidates; i++) {
    // Vary distance by ±15% to get different route options
    const distanceVariation = 1.0 + (Math.random() * 0.3 - 0.15); // -15% to +15%
    const candidateDistanceMeters = distanceMeters * distanceVariation;

    try {
      // Build TrailRouter query parameters with correct names
      const params = new URLSearchParams({
        coordinates: `${userLng},${userLat}`, // Longitude first, then latitude
        roundtrip: routeType === "loop" ? "true" : "false",
        target_distance: candidateDistanceMeters.toFixed(0), // meters
        green_preference: greenPreference.toFixed(2),
        hills_preference: hillsPreference.toFixed(2),
        avoid_unlit_streets: avoidUnlitStreets.toString(),
        avoid_unsafe_streets: avoidUnsafeStreets.toString(),
        avoid_repetition: "true",
      });

      // Use baseUrl exactly as-is, only add query string
      const url = `${baseUrl}?${params.toString()}`;
      
      // Debug logging before fetch
      console.log(`[TrailRouter] Candidate ${i + 1} request URL:`, url);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.warn(
          `TrailRouter candidate ${i + 1} failed: ${response.status} ${response.statusText}`,
          errorText.substring(0, 200)
        );
        continue;
      }

      // TrailRouter API response structure
      // Response format: { routes: [{ distance, geometry, score, greenScore, ascent, ... }] }
      const json = (await response.json()) as {
        routes?: Array<{
          distance?: number; // meters
          ascent?: number; // meters (elevation gain)
          geometry?: {
            type?: string;
            coordinates?: Array<[number, number] | [number, number, number]>; // 2D or 3D coordinates [lng, lat] or [lng, lat, elevation]
          };
          score?: number;
          greenScore?: number;
          [key: string]: unknown; // Allow other fields
        }>;
        [key: string]: unknown; // Allow other fields
      };

      // Extract the first route from the routes array
      const routeData = json.routes?.[0];
      
      if (!routeData) {
        console.warn(`TrailRouter candidate ${i + 1}: No routes array or empty routes in response`, JSON.stringify(json).substring(0, 300));
        continue;
      }

      // Extract geometry coordinates - handle both 2D [lng, lat] and 3D [lng, lat, elevation]
      const rawCoords = routeData.geometry?.coordinates;
      
      if (!rawCoords || !Array.isArray(rawCoords) || rawCoords.length === 0) {
        console.warn(`TrailRouter candidate ${i + 1}: No valid geometry coordinates in route`, JSON.stringify(routeData).substring(0, 300));
        continue;
      }

      // Convert 3D coordinates to 2D: [lng, lat, ele] -> [lng, lat]
      const coordinates = rawCoords.map((c) => {
        if (Array.isArray(c) && c.length >= 2) {
          return [c[0], c[1]] as [number, number]; // Take first two elements (lng, lat)
        }
        return null;
      }).filter((c): c is [number, number] => c !== null);

      if (coordinates.length === 0) {
        console.warn(`TrailRouter candidate ${i + 1}: Could not extract valid 2D coordinates`, JSON.stringify(rawCoords).substring(0, 200));
        continue;
      }

      // Extract distance (convert meters to miles)
      const distanceMeters = routeData.distance ?? 0;
      const distanceMiles = distanceMeters / 1609.34;

      // Extract elevation gain - use 'ascent' field (convert meters to feet)
      const elevationGainMeters = routeData.ascent ?? 0;
      const elevationGainFeet = elevationGainMeters * 3.28084;

      // Build Route object compatible with our recommendation system
      const route: Route = {
        id: `trailrouter-${userLat.toFixed(4)}-${userLng.toFixed(4)}-${i}`,
        name: `TrailRouter ${routeType === "loop" ? "Loop" : "Out & Back"} #${i + 1} (${distanceMiles.toFixed(1)} mi)`,
        distance: distanceMiles,
        elevationGain: elevationGainFeet,
        surfaceType: "mixed", // TODO: Extract from TrailRouter response if available
        hasLighting: true, // TODO: Determine from TrailRouter metadata or location heuristics
        safetyScore: 75, // TODO: Enhance with TrailRouter metadata or location-based heuristics (default 75/100)
        weatherComfort: 80, // TODO: Enhance with TrailRouter metadata or weather data (default 80/100)
        routeShape: routeType === "loop" ? "loop" : "out-and-back",
        popularity: 70, // TODO: Enhance with TrailRouter usage data if available (default 70/100)
        scenicScore: 75, // TODO: Enhance with TrailRouter metadata or location-based heuristics (default 75/100)
        geojson: {
          type: "LineString",
          coordinates: coordinates as [number, number][],
        },
        description: `Generated route near ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`,
        createdAt: new Date(),
      };

      candidates.push(route);
    } catch (error) {
      console.error(`Error generating TrailRouter candidate ${i + 1}:`, error);
      // Continue to next candidate
    }
  }

  return candidates;
}

