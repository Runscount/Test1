import { NextResponse } from "next/server";
import { getRecommendedRoutes, type RecommendationPreferences, type ScoredRoute } from "@/lib/recommendation";
import { generateTrailRouterCandidates } from "@/lib/trailrouter";

/**
 * Recommendation API Route
 * 
 * This endpoint uses TrailRouter to generate real-world candidate routes near the user's starting location,
 * then scores them with our recommendation logic and returns the top N (default 3).
 * 
 * Response shape:
 * {
 *   routes: ScoredRoute[];  // Array of routes with scoring information
 *   count: number;          // Number of routes returned
 *   preferences?: RecommendationPreferences; // Preferences used for scoring (optional)
 * }
 * 
 * Each ScoredRoute extends Route with:
 * - score: number (0-100, weighted total score)
 * - scoreBreakdown: { scenic, safety, lighting, elevation, popularity, distance, proximity } (component scores)
 */

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as RecommendationPreferences & { 
      userLat?: number;
      userLng?: number;
      limit?: number;
    } | null;

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Extract and validate starting location
    const userLat = body.userLat;
    const userLng = body.userLng;

    if (userLat === undefined || userLng === undefined || isNaN(userLat) || isNaN(userLng)) {
      return NextResponse.json(
        { error: "Missing starting location (userLat and userLng are required)" },
        { status: 400 }
      );
    }

    // Extract limit from query params or body (default: 3)
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const limit = Math.min(Number(limitParam ?? body.limit ?? 3), 50);

    // Validate limit
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 50" },
        { status: 400 }
      );
    }

    // Validate target distance
    if (!body.targetDistance || body.targetDistance <= 0) {
      return NextResponse.json(
        { error: "targetDistance is required and must be greater than 0" },
        { status: 400 }
      );
    }

    // Build preferences object for TrailRouter parameter mapping
    const preferences: RecommendationPreferences = {
      ...body,
      userLat,
      userLng,
    };

    // Generate candidate routes using TrailRouter
    let candidates;
    try {
      candidates = await generateTrailRouterCandidates({
        userLat,
        userLng,
        targetDistanceMiles: body.targetDistance,
        numCandidates: 6,
        routeType: "loop", // TODO: Extract from preferences if available
        preferences, // Pass preferences to map to TrailRouter parameters
      });
    } catch (error) {
      console.error("TrailRouter API error:", error);
      return NextResponse.json(
        { error: "Failed to generate routes. Please try again." },
        { status: 502 }
      );
    }

    if (candidates.length === 0) {
      return NextResponse.json(
        { 
          error: "No routes found. Please try a different starting location.",
          routes: [],
          count: 0
        },
        { status: 200 }
      );
    }

    // Score and rank the candidates (preferences already built above)
    const scored = getRecommendedRoutes(candidates, preferences, limit);

    return NextResponse.json({
      routes: scored,
      count: scored.length,
      preferences: body,
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}

// Also support GET for simple queries
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    
    // Extract preferences from query params
    const preferences: RecommendationPreferences = {};
    
    const targetDistance = url.searchParams.get("targetDistance");
    if (targetDistance) {
      preferences.targetDistance = parseFloat(targetDistance);
    }
    
    const distanceTolerance = url.searchParams.get("distanceTolerance");
    if (distanceTolerance) {
      preferences.distanceTolerance = parseFloat(distanceTolerance);
    }
    
    const scenicWeight = url.searchParams.get("scenicWeight");
    if (scenicWeight) {
      preferences.scenicWeight = parseFloat(scenicWeight);
    }
    
    const safetyWeight = url.searchParams.get("safetyWeight");
    if (safetyWeight) {
      preferences.safetyWeight = parseFloat(safetyWeight);
    }
    
    const nightMode = url.searchParams.get("nightMode");
    if (nightMode) {
      preferences.nightMode = nightMode === "true";
    }
    
    const preferHills = url.searchParams.get("preferHills");
    if (preferHills) {
      preferences.preferHills = preferHills === "true";
    }
    
    const preferredSurface = url.searchParams.get("preferredSurface");
    if (preferredSurface && ["paved", "trail", "mixed", "any"].includes(preferredSurface)) {
      preferences.preferredSurface = preferredSurface as "paved" | "trail" | "mixed" | "any";
    }
    
    // Location-based parameters (required)
    const lat = url.searchParams.get("lat");
    const lng = url.searchParams.get("lng");
    
    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Missing starting location (lat and lng query params are required)" },
        { status: 400 }
      );
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    if (isNaN(userLat) || isNaN(userLng)) {
      return NextResponse.json(
        { error: "Invalid latitude or longitude" },
        { status: 400 }
      );
    }

    preferences.userLat = userLat;
    preferences.userLng = userLng;
    
    const radius = url.searchParams.get("radius");
    if (radius) {
      preferences.maxDistanceMiles = parseFloat(radius);
    }
    
    // Validate target distance
    if (!preferences.targetDistance || preferences.targetDistance <= 0) {
      return NextResponse.json(
        { error: "targetDistance query param is required and must be greater than 0" },
        { status: 400 }
      );
    }
    
    const limitParam = url.searchParams.get("limit");
    const limit = Math.min(Number(limitParam ?? 3), 50);
    
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 50" },
        { status: 400 }
      );
    }

    // Generate candidate routes using TrailRouter
    let candidates;
    try {
      candidates = await generateTrailRouterCandidates({
        userLat,
        userLng,
        targetDistanceMiles: preferences.targetDistance,
        numCandidates: 6,
        routeType: "loop", // TODO: Extract from query params if available
        preferences, // Pass preferences to map to TrailRouter parameters
      });
    } catch (error) {
      console.error("TrailRouter API error:", error);
      return NextResponse.json(
        { error: "Failed to generate routes. Please try again." },
        { status: 502 }
      );
    }

    if (candidates.length === 0) {
      return NextResponse.json(
        { 
          error: "No routes found. Please try a different starting location.",
          routes: [],
          count: 0
        },
        { status: 200 }
      );
    }
    
    // Score and rank the candidates
    const scored = getRecommendedRoutes(candidates, preferences, limit);
    
    return NextResponse.json({
      routes: scored,
      count: scored.length,
      preferences,
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

