import { NextResponse } from "next/server";

interface GenerateRouteInput {
  lat?: number;
  lng?: number;
  distanceMiles?: number;
}

interface MapboxDirectionsResponse {
  routes?: Array<{
    geometry: GeoJSON.LineString;
    distance: number;
    duration: number;
  }>;
  message?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | GenerateRouteInput
    | null;

  if (
    !body ||
    typeof body.lat !== "number" ||
    typeof body.lng !== "number" ||
    typeof body.distanceMiles !== "number"
  ) {
    return NextResponse.json(
      { error: "lat, lng and distanceMiles are required" },
      { status: 400 }
    );
  }

  const token = process.env.MAPBOX_SECRET_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "MAPBOX_SECRET_TOKEN is not configured" },
      { status: 500 }
    );
  }

  const distanceMeters = body.distanceMiles * 1609.34;
  const latOffset = distanceMeters / 111320;

  const endLat = body.lat + latOffset;
  const endLng = body.lng;

  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${body.lng},${body.lat};${endLng},${endLat}?geometries=geojson&overview=full&access_token=${token}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    console.error("Failed to reach Mapbox Directions API:", error);
    return NextResponse.json(
      { error: "Unable to reach Mapbox Directions API" },
      { status: 502 }
    );
  }

  if (!response.ok) {
    const message = await response.text();
    console.error("Mapbox Directions error:", message);
    return NextResponse.json(
      { error: "Mapbox Directions API returned an error" },
      { status: 502 }
    );
  }

  const data = (await response.json()) as MapboxDirectionsResponse;
  const route = data.routes?.[0];

  if (!route) {
    console.error("Mapbox returned no route:", data);
    return NextResponse.json(
      { error: "No route found." },
      { status: 502 }
    );
  }

  if (
    route.geometry.type !== "LineString" ||
    !Array.isArray(route.geometry.coordinates)
  ) {
    console.error("Invalid geometry in Mapbox response:", route.geometry);
    return NextResponse.json(
      { error: "Invalid geometry returned by Mapbox Directions API" },
      { status: 502 }
    );
  }

  const distanceMiles = route.distance / 1609.34;
  const durationMinutes = route.duration / 60;

  const payload = {
    geometry: route.geometry,
    distanceMiles,
    durationMinutes,
  };

  console.log(
    "Directions geometry sample:",
    JSON.stringify(route.geometry).slice(0, 300)
  );
  console.log("Generated route payload:", payload);

  return NextResponse.json(payload);
}


