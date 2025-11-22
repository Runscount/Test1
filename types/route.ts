// Route data model
export type SurfaceType = "paved" | "trail" | "mixed";
export type RouteShape = "loop" | "point-to-point" | "out-and-back";

export interface Route {
  id: string;
  name: string;
  distance: number; // miles
  elevationGain: number; // feet
  surfaceType: SurfaceType;
  hasLighting: boolean;
  safetyScore: number; // 0–100
  weatherComfort: number; // 0–100
  routeShape: RouteShape;
  popularity: number; // 0–100
  scenicScore: number; // 0–100
  geojson: {
    type: "LineString";
    coordinates: [number, number][]; // [longitude, latitude]
  };
  description?: string;
  createdAt: Date;
}

