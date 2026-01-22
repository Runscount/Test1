/**
 * Find / Recommended Routes Page
 * 
 * This page allows users to:
 * 1. Generate custom running routes using Mapbox Directions API (via /api/generate-route)
 * 2. Get recommended routes from existing Chicago routes based on preferences (via /api/recommend)
 * 
 * The /api/recommend endpoint returns ScoredRoute[] which includes:
 * - The original Route object with all properties (distance, surfaceType, safetyScore, etc.)
 * - score: number (0-100, weighted total score for ranking)
 * - scoreBreakdown: object with component scores (scenic, safety, lighting, elevation, popularity, distance)
 * 
 * Routes are sorted by total score (highest first) and displayed as cards.
 * Clicking a recommended route shows its geometry on the map.
 */
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { searchLocations } from "@/lib/locationSearch";
import { cn } from "@/lib/utils";
import GeneratedRouteMap from "@/components/GeneratedRouteMap";
import type { ScoredRoute } from "@/lib/recommendation";
import WeatherCard, { getWeatherCondition } from "@/components/WeatherCard";

const routeTypeOptions = [
  { value: "loop", label: "Loop" },
  { value: "out-and-back", label: "Out & Back" },
];

const surfaceOptions = [
  { value: "any", label: "Any surface" },
  { value: "paved", label: "Paved" },
  { value: "trail", label: "Trail" },
  { value: "mixed", label: "Mixed" },
];

const elevationOptions = [
  { value: "flat", label: "Flat" },
  { value: "rolling", label: "Rolling" },
  { value: "hilly", label: "Hilly" },
];

const safetyOptions = [
  { value: "any", label: "Any" },
  { value: "70", label: "70+ Safety Score" },
  { value: "80", label: "80+ Safety Score" },
  { value: "90", label: "90+ Safety Score" },
];

export default function FindRoutePage() {
  const [locationInput, setLocationInput] = useState("");
  const [distanceValue, setDistanceValue] = useState([4]);
  const [routeType, setRouteType] = useState("loop");
  const [surfaceType, setSurfaceType] = useState("any");
  const [elevation, setElevation] = useState("rolling");
  const [safetyLevel, setSafetyLevel] = useState("80");
  
  // Consolidated starting location coordinates
  const [startLat, setStartLat] = useState<number | null>(null);
  const [startLng, setStartLng] = useState<number | null>(null);
  
  const [locating, setLocating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<
    Array<{ id: string; name: string; lat: number; lng: number }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionContainerRef = useRef<HTMLDivElement>(null);

  // Recommendation state
  const [recommendedRoutes, setRecommendedRoutes] = useState<ScoredRoute[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [errorRecommendations, setErrorRecommendations] = useState<string | null>(null);

  // Weather state
  const [weather, setWeather] = useState<{
    temperature: number;
    wind: number;
    condition: string;
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const distanceMiles = useMemo(() => distanceValue[0], [distanceValue]);

  // Conversion helper functions
  const cToF = (c: number): number => {
    return Math.round((c * 9/5) + 32);
  };

  const msToMph = (ms: number): number => {
    return Math.round(ms * 2.23694);
  };

  // Fetch weather when location is resolved
  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setWeatherLoading(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch weather");
      }
      const data = await res.json();
      const weatherCode = data.current_weather?.weathercode;
      setWeather({
        temperature: cToF(data.current_weather.temperature),
        wind: msToMph(data.current_weather.windspeed),
        condition: getWeatherCondition(weatherCode),
      });
    } catch (error) {
      console.error("Error fetching weather:", error);
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  // Fetch weather when starting location coordinates are available
  useEffect(() => {
    if (startLat !== null && startLng !== null) {
      fetchWeather(startLat, startLng);
    } else {
      setWeather(null);
    }
  }, [startLat, startLng, fetchWeather]);

  useEffect(() => {
    const query = locationInput.trim();
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = window.setTimeout(async () => {
      const results = await searchLocations(query);
      setSuggestions(results);
      setShowSuggestions(true);
      setIsSearching(false);
    }, 300);

    return () => window.clearTimeout(handler);
  }, [locationInput]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionContainerRef.current &&
        !suggestionContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setFormError("Geolocation is not supported in this browser.");
      return;
    }

    setLocating(true);
    setFormError(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setLocationInput("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setStartLat(lat);
        setStartLng(lng);
        setLocationInput(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      },
      () => {
        setLocating(false);
        setFormError("Unable to access your location. Please enter it manually.");
      }
    );
  }, []);

  const handleFindRecommendedRoutes = useCallback(async () => {
    // Validate starting location coordinates
    if (startLat === null || startLng === null) {
      setFormError("Please enter a starting location first");
      return;
    }

    setLoadingRecommendations(true);
    setErrorRecommendations(null);
    setFormError(null);
    setRecommendedRoutes([]);
    setSelectedRouteIndex(null);

    // Build preferences from form state according to mapping rules
    const params = new URLSearchParams();

    // Location parameters (required)
    params.append("lat", startLat.toString());
    params.append("lng", startLng.toString());
    params.append("radius", "3"); // 3 mile radius default

    // Distance mapping: distance slider value → targetDistance, with tolerance = 0.3
    params.append("targetDistance", distanceMiles.toString());
    params.append("distanceTolerance", "0.3");

    // Route type mapping: route type select → routeType
    // Note: The API currently doesn't filter by route type, but we pass it for future use
    if (routeType) {
      params.append("routeType", routeType);
    }

    // Safety emphasis mapping:
    // "Any" → default safety weight
    // "70+ Safety Score" → safetyWeight based on minimum
    // "80+ Safety Score" → safetyWeight based on minimum
    // "90+ Safety Score" → safetyWeight based on minimum
    if (safetyLevel !== "any") {
      const minSafety = parseInt(safetyLevel, 10);
      // Increase safety weight to emphasize safety when minimum is required
      // Higher minimum = higher weight on safety score
      const safetyWeight = minSafety / 100;
      params.append("safetyWeight", safetyWeight.toString());
    } else {
      // Default safety weight
      params.append("safetyWeight", "0.3");
    }

    // Surface preference mapping:
    // Use the surfaceType value directly
    params.append("preferredSurface", surfaceType);

    // Elevation mapping:
    // "Flat" → preferHills = false
    // "Hilly" → preferHills = true
    // "Rolling" → leave preferHills undefined for neutral preference
    if (elevation === "flat") {
      params.append("preferHills", "false");
    } else if (elevation === "hilly") {
      params.append("preferHills", "true");
    }

    // Always set scenic = true (high scenic weight)
    params.append("scenicWeight", "0.4"); // Higher weight for scenic preference

    // Night mode: default to false (no time-of-day control exists yet)
    params.append("nightMode", "false");

    // Limit to top 3 highest-scoring routes
    params.append("limit", "3");

    try {
      const response = await fetch(`/api/recommend?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to fetch recommendations");
      }

      const data = await response.json();
      
      if (data.routes && Array.isArray(data.routes)) {
        setRecommendedRoutes(data.routes);
        if (data.routes.length > 0) {
          setSelectedRouteIndex(0);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch recommendations";
      setErrorRecommendations(message);
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [startLat, startLng, distanceMiles, routeType, surfaceType, elevation, safetyLevel]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-hero px-4 py-10">
      <div className="container mx-auto flex max-w-5xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Smart Route Builder
          </p>
          <h1 className="mt-4 text-4xl font-bold text-foreground sm:text-5xl">
            Find Your Perfect Route
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Tell us what you&apos;re in the mood for—we&apos;ll craft a beautiful
            Chicago run tailored to you.
          </p>
        </div>

        <Card className="mx-auto w-full max-w-4xl border-0 shadow-card">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-foreground">
              Route Preferences
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Customize the vibe, terrain, and difficulty. We&apos;ll do the heavy
              lifting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-5 lg:grid-cols-[3fr_1fr]">
              <div className="space-y-2" ref={suggestionContainerRef}>
                <label className="text-sm font-medium text-foreground">
                  Starting location
                </label>
                <div className="relative">
                  <Input
                    placeholder="e.g. Navy Pier, 606 Trail, South Loop..."
                    value={locationInput}
                    onChange={(event) => {
                      setLocationInput(event.target.value);
                      setStartLat(null);
                      setStartLng(null);
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                  />
                  {showSuggestions && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-border bg-background p-2 shadow-card">
                      {isSearching ? (
                        <div className="space-y-2">
                          {[...Array(3)].map((_, idx) => (
                            <div
                              key={idx}
                              className="h-10 rounded-xl bg-muted animate-pulse"
                            />
                          ))}
                        </div>
                      ) : suggestions.length > 0 ? (
                        suggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            type="button"
                            className="flex w-full flex-col rounded-xl px-4 py-3 text-left transition hover:bg-muted/60"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                              setLocationInput(suggestion.name);
                              setStartLat(suggestion.lat);
                              setStartLng(suggestion.lng);
                              setSuggestions([]);
                              setShowSuggestions(false);
                            }}
                          >
                            <span className="text-sm font-medium text-foreground">
                              {suggestion.name}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm text-muted-foreground">
                          No matches yet. Try a different search.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-border text-foreground"
                  onClick={handleUseMyLocation}
                  disabled={locating}
                >
                  {locating ? "Locating..." : "Use my location"}
                </Button>
              </div>
            </div>

            {/* Weather Card */}
            {(weather !== null || weatherLoading) && (
              <div className="mt-2">
                <WeatherCard
                  temperature={weather?.temperature ?? null}
                  condition={weather?.condition ?? null}
                  wind={weather?.wind ?? null}
                  loading={weatherLoading}
                />
              </div>
            )}

            <div className="space-y-4 rounded-3xl bg-gradient-card p-6 shadow-soft">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Desired distance
                  </p>
                  <p className="text-3xl font-semibold text-foreground">
                    {distanceMiles.toFixed(1)} mi
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Slide to adjust between short shakeouts and longer adventures.
                </p>
              </div>
              <Slider
                value={distanceValue}
                min={1}
                max={10}
                step={0.1}
                onValueChange={setDistanceValue}
              />
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>1 mi</span>
                <span>10 mi</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FieldSelect
                label="Route type"
                value={routeType}
                onValueChange={setRouteType}
                options={routeTypeOptions}
              />
              <FieldSelect
                label="Surface preference"
                value={surfaceType}
                onValueChange={setSurfaceType}
                options={surfaceOptions}
              />
              <FieldSelect
                label="Elevation"
                value={elevation}
                onValueChange={setElevation}
                options={elevationOptions}
              />
              <FieldSelect
                label="Safety emphasis"
                value={safetyLevel}
                onValueChange={setSafetyLevel}
                options={safetyOptions}
              />
            </div>

            {formError && (
              <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {formError}
              </div>
            )}

            <Button
              type="button"
              className={cn(
                "w-full rounded-full bg-gradient-primary py-6 text-lg font-semibold text-white shadow-card transition hover:opacity-90",
                loadingRecommendations && "opacity-70"
              )}
              onClick={handleFindRecommendedRoutes}
              disabled={loadingRecommendations}
            >
              {loadingRecommendations ? "Finding routes..." : "Get Recommended Routes"}
            </Button>
          </CardContent>
        </Card>

        {/* Recommended Routes Section */}
        {errorRecommendations && (
          <div className="mx-auto w-full max-w-4xl rounded-3xl border border-red-100 bg-red-50/80 p-6 text-center text-red-700 shadow-lg">
            {errorRecommendations}
          </div>
        )}

        {recommendedRoutes.length > 0 && (
          <div className="mx-auto w-full max-w-5xl space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Your Recommended Routes
              </h2>
              <p className="mt-2 text-gray-600">
                Sorted by match score (highest first)
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendedRoutes.map((route, index) => (
                <Card
                  key={route.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-lg",
                    selectedRouteIndex === index
                      ? "ring-2 ring-blue-500 shadow-md"
                      : "hover:border-blue-300"
                  )}
                  onClick={() => setSelectedRouteIndex(index)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{route.name}</CardTitle>
                      {route.score !== undefined && (
                        <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                          {route.score.toFixed(0)}%
                        </div>
                      )}
                    </div>
                    <CardDescription>
                      {route.distance} mi • {route.elevationGain} ft elevation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Surface:</span>
                      <span className="font-medium capitalize">
                        {route.surfaceType}
                      </span>
                    </div>
                    {route.safetyScore !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Safety:</span>
                        <span className="font-medium">{route.safetyScore}/100</span>
                      </div>
                    )}
                    {route.scenicScore !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Scenic:</span>
                        <span className="font-medium">{route.scenicScore}/100</span>
                      </div>
                    )}
                    {route.hasLighting && (
                      <div className="text-xs text-green-600">✓ Well-lit</div>
                    )}
                    {route.scoreBreakdown && (
                      <div className="pt-2 border-t text-xs text-gray-500">
                        <div>Match: {route.scoreBreakdown.distance?.toFixed(0) || 0}%</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Map Preview for Selected Route */}
            {selectedRouteIndex !== null && recommendedRoutes[selectedRouteIndex] && (
              <div className="mt-8 rounded-3xl border border-blue-100 bg-white/80 p-8 shadow-2xl">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {recommendedRoutes[selectedRouteIndex].name}
                  </h3>
                  {recommendedRoutes[selectedRouteIndex].description && (
                    <p className="mt-2 text-gray-600">
                      {recommendedRoutes[selectedRouteIndex].description}
                    </p>
                  )}
                </div>
                <div className="h-96 overflow-hidden rounded-3xl shadow-xl ring-1 ring-blue-100">
                  <GeneratedRouteMap
                    geometry={
                      recommendedRoutes[selectedRouteIndex]
                        ? ({
                            type: "LineString",
                            coordinates: recommendedRoutes[selectedRouteIndex].geojson.coordinates,
                          } as GeoJSON.LineString)
                        : null
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

function FieldSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="rounded-2xl bg-background/90">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


