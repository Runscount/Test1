interface GeocodeFeature {
  geometry: {
    coordinates: [number, number];
  };
}

interface GeocodeResponse {
  features?: GeocodeFeature[];
}

export async function geocodeLocation(
  query: string
): Promise<{ lat: number; lng: number } | null> {
  if (!query.trim()) {
    return null;
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    console.error(
      "NEXT_PUBLIC_MAPBOX_TOKEN is not configured. Geocoding unavailable."
    );
    return null;
  }

  const encodedQuery = encodeURIComponent(query);
  const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodedQuery}&limit=1&access_token=${token}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        "Mapbox geocoding failed:",
        response.status,
        response.statusText
      );
      return null;
    }

    const data = (await response.json()) as GeocodeResponse;
    const coordinates = data.features?.[0]?.geometry.coordinates;

    if (!coordinates) {
      return null;
    }

    return {
      lng: coordinates[0],
      lat: coordinates[1],
    };
  } catch (error) {
    console.error("Failed to geocode location:", error);
    return null;
  }
}


