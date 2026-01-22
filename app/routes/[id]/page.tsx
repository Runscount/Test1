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
    <div className="bg-gradient-hero px-4 py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">{route.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{route.description}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="h-96 lg:h-[500px]">
              <Map routes={[route]} selectedRouteId={route.id} />
            </div>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Route Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance:</span>
                  <span className="font-medium">{route.distance} miles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Elevation Gain:</span>
                  <span className="font-medium">{route.elevationGain} feet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Surface Type:</span>
                  <span className="font-medium capitalize">{route.surfaceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route Shape:</span>
                  <span className="font-medium capitalize">
                    {route.routeShape.replace("-", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lighting:</span>
                  <span className="font-medium">
                    {route.hasLighting ? "Yes" : "No"}
                  </span>
                </div>
              </CardContent>
            </Card>

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
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{value}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

