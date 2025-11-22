import { notFound } from "next/navigation";
import { sampleRoutes } from "@/data/routes";
import { Map } from "@/components/Map";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Route } from "@/types/route";

interface RouteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RouteDetailPage({ params }: RouteDetailPageProps) {
  const { id } = await params;
  const route = sampleRoutes.find((r) => r.id === id);

  if (!route) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">{route.name}</h1>
        <p className="text-lg text-gray-600">{route.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Map */}
        <div className="h-96 lg:h-[500px]">
          <Map routes={[route]} selectedRouteId={route.id} />
        </div>

        {/* Route Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Distance:</span>
                <span className="font-medium">{route.distance} miles</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Elevation Gain:</span>
                <span className="font-medium">{route.elevationGain} feet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Surface Type:</span>
                <span className="font-medium capitalize">{route.surfaceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Route Shape:</span>
                <span className="font-medium capitalize">
                  {route.routeShape.replace("-", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lighting:</span>
                <span className="font-medium">
                  {route.hasLighting ? "Yes" : "No"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
              <CardDescription>
                How this route scores across different dimensions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScoreBar
                label="Safety"
                value={route.safetyScore}
                color="bg-green-500"
              />
              <ScoreBar
                label="Weather Comfort"
                value={route.weatherComfort}
                color="bg-blue-500"
              />
              <ScoreBar
                label="Scenic"
                value={route.scenicScore}
                color="bg-purple-500"
              />
              <ScoreBar
                label="Popularity"
                value={route.popularity}
                color="bg-orange-500"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">{value}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

