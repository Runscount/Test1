"use server";

import { NextResponse } from "next/server";

interface MapboxDirectionsResponse {
  routes?: Array<{
    geometry: GeoJSON.LineString;
    distance: number;
    duration: number;
  }>;
  code?: string;
  message?: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json(
      { error: "Missing 'start' or 'end' query param" },
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

  const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/walking/${start};${end}?geometries=geojson&overview=full&access_token=${token}`;

  let response: Response;
  try {
    response = await fetch(directionsUrl);
  } catch (error) {
    console.error("Failed to contact Mapbox Directions API:", error);
    return NextResponse.json(
      { error: "Unable to reach Mapbox Directions API" },
      { status: 502 }
    );
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Mapbox Directions API error:", errorBody);
    return NextResponse.json(
      { error: "Mapbox Directions API returned an error" },
      { status: 502 }
    );
  }

  const data = (await response.json()) as MapboxDirectionsResponse;
  const route = data.routes?.[0];

  if (!route) {
    return NextResponse.json(
      { error: "No route returned by Mapbox Directions API" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    geometry: route.geometry,
    distance: route.distance,
    duration: route.duration,
  });
}


