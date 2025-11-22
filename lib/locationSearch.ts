export type LocationSuggestion = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

interface GeocodingFeature {
  id: string;
  place_name: string;
  center: [number, number];
}

interface GeocodingResponse {
  features?: GeocodingFeature[];
}

export async function searchLocations(
  query: string
): Promise<LocationSuggestion[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    console.error(
      "NEXT_PUBLIC_MAPBOX_TOKEN is missing. Unable to search locations."
    );
    return [];
  }

  const params = new URLSearchParams({
    autocomplete: "true",
    limit: "5",
    language: "en",
    country: "US",
    proximity: "-87.6298,41.8781",
    access_token: token,
  });

  const baseUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    trimmed
  )}.json`;
  const url = `${baseUrl}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Mapbox location search failed:", response.statusText);
      return [];
    }

    const data = (await response.json()) as GeocodingResponse;
    const mapped =
      data.features?.map((feature) => {
        const [lng, lat] = feature.center;
        return {
          id: feature.id,
          name: feature.place_name,
          lat,
          lng,
        };
      }) ?? [];

    if (mapped.length === 0) {
      console.info("Mapbox returned no suggestions for query:", trimmed);
    }

    return mapped;
  } catch (error) {
    console.error("Failed to search locations:", error);
    return [];
  }
}
