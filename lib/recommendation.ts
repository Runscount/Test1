import { Route } from "@/types/route";

export interface RecommendationPreferences {
  // Distance preference (target distance in miles)
  targetDistance?: number;
  distanceTolerance?: number; // How much distance can deviate from target (default: 2 miles)
  
  // Weight preferences (0-1, sum should be ~1.0 for best results)
  scenicWeight?: number; // Default: 0.3
  safetyWeight?: number; // Default: 0.3
  lightingWeight?: number; // Default: 0.2 (for night mode)
  elevationWeight?: number; // Default: 0.1 (for hills preference)
  popularityWeight?: number; // Default: 0.1
  proximityWeight?: number; // Default: 0.1 (for location-based ranking)
  
  // Boolean preferences
  nightMode?: boolean; // Prefer routes with lighting
  preferHills?: boolean; // true = prefer more elevation, false = prefer flat
  
  // Surface preference
  preferredSurface?: "paved" | "trail" | "mixed" | "any";
  
  // Location-based filtering and scoring
  userLat?: number; // User's starting latitude
  userLng?: number; // User's starting longitude
  maxDistanceMiles?: number; // Maximum distance from user location to route start (in miles)
}

export interface ScoredRoute extends Route {
  score: number;
  scoreBreakdown: {
    scenic: number;
    safety: number;
    lighting: number;
    elevation: number;
    popularity: number;
    distance: number;
    proximity?: number; // Proximity score (0-100) if location-based
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
function distanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get the starting coordinate of a route (first coordinate in geometry)
 */
function getRouteStartCoordinate(route: Route): { lat: number; lng: number } | null {
  if (route.geojson && route.geojson.coordinates && route.geojson.coordinates.length > 0) {
    const firstCoord = route.geojson.coordinates[0];
    return { lat: firstCoord[1], lng: firstCoord[0] }; // GeoJSON is [lng, lat]
  }
  return null;
}

/**
 * Calculate a recommendation score for a route based on user preferences
 */
function calculateRouteScore(
  route: Route,
  prefs: RecommendationPreferences,
  proximityToStart?: number // Distance in miles from user location to route start
): ScoredRoute {
  // Normalize weights (default values)
  const scenicWeight = prefs.scenicWeight ?? 0.25;
  const safetyWeight = prefs.safetyWeight ?? 0.25;
  const lightingWeight = prefs.lightingWeight ?? 0.15;
  const elevationWeight = prefs.elevationWeight ?? 0.1;
  const popularityWeight = prefs.popularityWeight ?? 0.1;
  const proximityWeight = prefs.proximityWeight ?? 0.15; // 15% weight for proximity
  
  // Scenic score (0-100, normalized to 0-1)
  const scenicScore = route.scenicScore / 100;
  
  // Safety score (0-100, normalized to 0-1)
  const safetyScore = route.safetyScore / 100;
  
  // Lighting score (binary: 1 if has lighting and night mode is on, 0.5 if has lighting, 0 if no lighting and night mode)
  const lightingScore = prefs.nightMode
    ? route.hasLighting ? 1.0 : 0.2
    : route.hasLighting ? 0.7 : 0.5;
  
  // Elevation score
  // Normalize elevation gain (0-200 feet = 0-1 scale, but favor based on preference)
  const normalizedElevation = Math.min(route.elevationGain / 200, 1.0);
  const elevationScore = prefs.preferHills === undefined
    ? 0.5 // Neutral if not specified
    : prefs.preferHills
    ? normalizedElevation // Higher elevation = better if preferHills is true
    : 1 - normalizedElevation; // Lower elevation = better if preferHills is false
  
  // Popularity score (0-100, normalized to 0-1)
  const popularityScore = route.popularity / 100;
  
  // Distance score (how close to target distance)
  let distanceScore = 1.0;
  if (prefs.targetDistance !== undefined) {
    const tolerance = prefs.distanceTolerance ?? 2.0;
    const distanceDiff = Math.abs(route.distance - prefs.targetDistance);
    if (distanceDiff > tolerance) {
      distanceScore = Math.max(0, 1 - (distanceDiff - tolerance) / tolerance);
    } else {
      distanceScore = 1 - (distanceDiff / tolerance) * 0.5; // Perfect match = 1.0, within tolerance = 0.5-1.0
    }
  }
  
  // Surface preference bonus
  let surfaceBonus = 0;
  if (prefs.preferredSurface && prefs.preferredSurface !== "any") {
    if (route.surfaceType === prefs.preferredSurface) {
      surfaceBonus = 0.1; // Small bonus for matching surface preference
    }
  }
  
  // Proximity score (how close the route start is to user location)
  let proximityScore = 0.5; // Default neutral score if no location provided
  if (proximityToStart !== undefined && prefs.maxDistanceMiles) {
    // Normalize proximity: closer = higher score (1.0 at 0 miles, 0.0 at maxDistanceMiles)
    if (proximityToStart <= prefs.maxDistanceMiles) {
      proximityScore = 1 - (proximityToStart / prefs.maxDistanceMiles) * 0.5; // At max distance, score is 0.5
    } else {
      proximityScore = 0; // Beyond max distance gets 0 score
    }
  } else if (proximityToStart !== undefined) {
    // If no max distance specified, use a default scale (0-10 miles)
    const maxDist = 10;
    if (proximityToStart <= maxDist) {
      proximityScore = 1 - (proximityToStart / maxDist) * 0.5;
    } else {
      proximityScore = 0;
    }
  }
  
  // Calculate weighted total score
  const weightedScore =
    scenicScore * scenicWeight +
    safetyScore * safetyWeight +
    lightingScore * lightingWeight +
    elevationScore * elevationWeight +
    popularityScore * popularityWeight +
    proximityScore * proximityWeight +
    distanceScore * 0.15 + // Distance match weight reduced slightly to make room for proximity
    surfaceBonus;
  
  return {
    ...route,
    score: Math.min(100, weightedScore * 100), // Scale to 0-100
    scoreBreakdown: {
      scenic: scenicScore * 100,
      safety: safetyScore * 100,
      lighting: lightingScore * 100,
      elevation: elevationScore * 100,
      popularity: popularityScore * 100,
      distance: distanceScore * 100,
      proximity: proximityScore * 100,
    },
  };
}

/**
 * Get recommended routes based on user preferences
 * 
 * This function accepts an array of candidate routes, filters and scores them based on preferences,
 * and returns the top N routes sorted by score.
 */
export function getRecommendedRoutes(
  routes: Route[],
  preferences: RecommendationPreferences,
  limit: number = 10
): ScoredRoute[] {
  // Start with provided routes
  let filteredRoutes = [...routes];
  
  // Filter by surface preference if specified
  if (preferences.preferredSurface && preferences.preferredSurface !== "any") {
    filteredRoutes = filteredRoutes.filter((route) => route.surfaceType === preferences.preferredSurface);
  }
  
  // Filter by night mode (if enabled, require lighting)
  if (preferences.nightMode) {
    filteredRoutes = filteredRoutes.filter((route) => route.hasLighting);
  }
  
  // Filter by proximity if user location is provided
  const routesWithProximity: Array<{ route: Route; proximityMiles?: number }> = [];
  
  for (const route of filteredRoutes) {
    let proximityMiles: number | undefined;
    
    // Calculate distance from user location to route start if provided
    if (preferences.userLat !== undefined && preferences.userLng !== undefined) {
      const routeStart = getRouteStartCoordinate(route);
      if (routeStart) {
        proximityMiles = distanceMiles(
          preferences.userLat,
          preferences.userLng,
          routeStart.lat,
          routeStart.lng
        );
        
        // Filter out routes beyond max distance if specified
        if (preferences.maxDistanceMiles !== undefined) {
          if (proximityMiles > preferences.maxDistanceMiles) {
            continue; // Skip this route
          }
        }
      }
    }
    
    routesWithProximity.push({ route, proximityMiles });
  }
  
  // Score all routes (with proximity if available)
  const scoredRoutes = routesWithProximity.map(({ route, proximityMiles }) =>
    calculateRouteScore(route, preferences, proximityMiles)
  );
  
  // Sort by score (highest first)
  scoredRoutes.sort((a, b) => b.score - a.score);
  
  // Return top N routes
  return scoredRoutes.slice(0, limit);
}

