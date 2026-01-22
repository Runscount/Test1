"use client";

import { useState, useMemo } from "react";
import { sampleRoutes } from "@/data/routes";
import { Map } from "@/components/Map";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SurfaceType } from "@/types/route";
import Link from "next/link";

type SortOption = "safetyScore" | "scenicScore" | "distance";

export default function RoutesPage() {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);
  const [minDistance, setMinDistance] = useState<number>(0);
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [surfaceFilter, setSurfaceFilter] = useState<SurfaceType | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("safetyScore");

  const filteredAndSortedRoutes = useMemo(() => {
    let filtered = sampleRoutes.filter((route) => {
      const distanceMatch =
        route.distance >= minDistance && route.distance <= maxDistance;
      const surfaceMatch =
        surfaceFilter === "all" || route.surfaceType === surfaceFilter;
      return distanceMatch && surfaceMatch;
    });

    // Sort routes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "safetyScore":
          return b.safetyScore - a.safetyScore;
        case "scenicScore":
          return b.scenicScore - a.scenicScore;
        case "distance":
          return a.distance - b.distance;
        default:
          return 0;
      }
    });

    return filtered;
  }, [minDistance, maxDistance, surfaceFilter, sortBy]);

  const displayRouteId = hoveredRouteId || selectedRouteId;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-gradient-hero lg:flex-row">
      {/* Left Sidebar - Route List */}
      <div className="w-full border-r border-border bg-background/80 backdrop-blur lg:w-96 lg:overflow-y-auto">
        <div className="sticky top-16 z-10 border-b border-border bg-background/90 p-5 backdrop-blur">
          <h1 className="text-2xl font-semibold text-foreground">Routes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Filter by distance, surface, and safety.
          </p>

          {/* Filters */}
          <div className="mt-5 space-y-4">
            {/* Distance Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Distance (miles)
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={minDistance}
                  onChange={(e) => setMinDistance(parseFloat(e.target.value) || 0)}
                  placeholder="Min"
                />
                <Input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(parseFloat(e.target.value) || 10)}
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Surface Type Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Surface Type
              </label>
              <select
                value={surfaceFilter}
                onChange={(e) =>
                  setSurfaceFilter(e.target.value as SurfaceType | "all")
                }
                className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground shadow-soft transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="all">All</option>
                <option value="paved">Paved</option>
                <option value="trail">Trail</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground shadow-soft transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="safetyScore">Safety Score</option>
                <option value="scenicScore">Scenic Score</option>
                <option value="distance">Distance</option>
              </select>
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {filteredAndSortedRoutes.length} route
            {filteredAndSortedRoutes.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Route Cards */}
        <div className="space-y-4 p-5">
          {filteredAndSortedRoutes.map((route) => (
            <Link key={route.id} href={`/routes/${route.id}`}>
              <Card
                className={`cursor-pointer transition-all hover-lift ${
                  displayRouteId === route.id ? "ring-2 ring-primary" : ""
                }`}
                onMouseEnter={() => setHoveredRouteId(route.id)}
                onMouseLeave={() => setHoveredRouteId(null)}
                onClick={() => setSelectedRouteId(route.id)}
              >
                <CardHeader>
                  <CardTitle>{route.name}</CardTitle>
                  <CardDescription>
                    {route.distance} miles • {route.elevationGain} ft elevation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Surface:</span>
                      <span className="font-medium capitalize">
                        {route.surfaceType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Safety:</span>
                      <span className="font-medium">{route.safetyScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weather:</span>
                      <span className="font-medium">
                        {route.weatherComfort}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scenic:</span>
                      <span className="font-medium">{route.scenicScore}/100</span>
                    </div>
                    {route.hasLighting && (
                      <div className="text-xs text-green-600">✓ Well-lit</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Right Side - Map */}
      <div className="flex-1">
        <Map
          routes={filteredAndSortedRoutes}
          selectedRouteId={displayRouteId}
          onRouteClick={setSelectedRouteId}
        />
      </div>
    </div>
  );
}

