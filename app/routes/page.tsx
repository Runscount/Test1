"use client";

import { useState, useMemo } from "react";
import { sampleRoutes } from "@/data/routes";
import { Map } from "@/components/Map";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
      {/* Left Sidebar - Route List */}
      <div className="w-full border-r bg-gray-50 lg:w-96 lg:overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white p-4 shadow-sm">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Routes</h1>

          {/* Filters */}
          <div className="space-y-4">
            {/* Distance Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Distance (miles)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={minDistance}
                  onChange={(e) => setMinDistance(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Min"
                />
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(parseFloat(e.target.value) || 10)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Surface Type Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Surface Type
              </label>
              <select
                value={surfaceFilter}
                onChange={(e) =>
                  setSurfaceFilter(e.target.value as SurfaceType | "all")
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="paved">Paved</option>
                <option value="trail">Trail</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="safetyScore">Safety Score</option>
                <option value="scenicScore">Scenic Score</option>
                <option value="distance">Distance</option>
              </select>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            {filteredAndSortedRoutes.length} route
            {filteredAndSortedRoutes.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Route Cards */}
        <div className="space-y-4 p-4">
          {filteredAndSortedRoutes.map((route) => (
            <Link key={route.id} href={`/routes/${route.id}`}>
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  displayRouteId === route.id ? "ring-2 ring-blue-500" : ""
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
                      <span className="text-gray-600">Surface:</span>
                      <span className="font-medium capitalize">
                        {route.surfaceType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Safety:</span>
                      <span className="font-medium">{route.safetyScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weather:</span>
                      <span className="font-medium">
                        {route.weatherComfort}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Scenic:</span>
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

