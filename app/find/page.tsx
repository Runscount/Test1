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
import { geocodeLocation } from "@/lib/geocode";
import { searchLocations } from "@/lib/locationSearch";
import { useGeneratedRoute } from "@/lib/useGeneratedRoute";
import { cn } from "@/lib/utils";
import GeneratedRouteMap from "@/components/GeneratedRouteMap";

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
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [generatedGeometry, setGeneratedGeometry] =
    useState<GeoJSON.LineString | null>(null);
  const [suggestions, setSuggestions] = useState<
    Array<{ id: string; name: string; lat: number; lng: number }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocationCoords, setSelectedLocationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const suggestionContainerRef = useRef<HTMLDivElement>(null);

  const { data, loading, error, generateRoute } = useGeneratedRoute();

  const distanceMiles = useMemo(() => distanceValue[0], [distanceValue]);
  const previewDistance = data?.distanceMiles;
  const previewDuration = data?.durationMinutes;

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
    setSelectedLocationCoords(null);
    setLocationInput("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setLocating(false);
        setFormError("Unable to access your location. Please enter it manually.");
      }
    );
  }, []);

  const handleGenerateRoute = useCallback(async () => {
    setFormError(null);
    setGeneratedGeometry(null);

    let coordinates: { lat: number; lng: number } | null = null;
    const trimmedInput = locationInput.trim();

    if (selectedLocationCoords) {
      coordinates = selectedLocationCoords;
    } else if (!trimmedInput && userLocation) {
      coordinates = userLocation;
    } else if (trimmedInput) {
      coordinates = await geocodeLocation(trimmedInput);
      if (!coordinates) {
        setFormError("We couldn't find that location. Try another search.");
        return;
      }
    } else if (userLocation) {
      coordinates = userLocation;
    } else {
      setFormError("Enter a location or use your current position.");
      return;
    }

    const result = await generateRoute(
      coordinates.lat,
      coordinates.lng,
      distanceMiles
    );

    if (result?.geometry) {
      console.log("Setting generatedGeometry:", result.geometry);
      setGeneratedGeometry(result.geometry);
    } else {
      console.warn("NO geometry in result:", result);
    }
  }, [distanceMiles, generateRoute, locationInput, userLocation]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-blue-50 via-white to-white px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-500">
            Smart Route Builder
          </p>
          <h1 className="mt-4 text-4xl font-bold text-gray-900 sm:text-5xl">
            Find Your Perfect Route
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Tell us what you&apos;re in the mood for—we&apos;ll craft a beautiful
            Chicago run tailored to you.
          </p>
        </div>

        <Card className="mx-auto w-full max-w-4xl rounded-3xl border-0 bg-white/90 shadow-xl ring-1 ring-blue-100 backdrop-blur">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-gray-900">
              Route Preferences
            </CardTitle>
            <CardDescription className="text-base text-gray-500">
              Customize the vibe, terrain, and difficulty. We&apos;ll do the heavy
              lifting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-5 lg:grid-cols-[3fr_1fr]">
              <div className="space-y-2" ref={suggestionContainerRef}>
                <label className="text-sm font-medium text-gray-700">
                  Starting location
                </label>
                <div className="relative">
                  <Input
                    placeholder="e.g. Navy Pier, 606 Trail, South Loop..."
                    value={locationInput}
                    onChange={(event) => {
                      setLocationInput(event.target.value);
                      setSelectedLocationCoords(null);
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                  />
                  {showSuggestions && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl">
                      {isSearching ? (
                        <div className="space-y-2">
                          {[...Array(3)].map((_, idx) => (
                            <div
                              key={idx}
                              className="h-10 rounded-xl bg-gray-100 animate-pulse"
                            />
                          ))}
                        </div>
                      ) : suggestions.length > 0 ? (
                        suggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            type="button"
                            className="flex w-full flex-col rounded-xl px-4 py-3 text-left transition hover:bg-blue-50"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                              setLocationInput(suggestion.name);
                              setSelectedLocationCoords({
                                lat: suggestion.lat,
                                lng: suggestion.lng,
                              });
                              setSuggestions([]);
                              setShowSuggestions(false);
                              setUserLocation(null);
                            }}
                          >
                            <span className="text-sm font-medium text-gray-900">
                              {suggestion.name}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm text-gray-500">
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
                  className="w-full rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={handleUseMyLocation}
                  disabled={locating}
                >
                  {locating ? "Locating..." : "Use my location"}
                </Button>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Desired distance
                  </p>
                  <p className="text-3xl font-semibold text-gray-900">
                    {distanceMiles.toFixed(1)} mi
                  </p>
                </div>
                <p className="text-sm text-gray-500">
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
              <div className="flex justify-between text-xs font-medium text-gray-500">
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
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <Button
              type="button"
              className={cn(
                "w-full rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 py-6 text-lg font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600",
                loading && "opacity-70"
              )}
              onClick={handleGenerateRoute}
              disabled={loading}
            >
              {loading ? "Designing your route..." : "Generate My Route"}
            </Button>
          </CardContent>
        </Card>

        {loading && (
          <div className="mx-auto w-full max-w-4xl rounded-3xl bg-white/70 p-10 shadow-xl">
            <div className="flex flex-col gap-6">
              <div className="h-6 w-40 rounded-full bg-gray-200/80 animate-pulse" />
              <div className="h-96 w-full rounded-2xl bg-gray-100 animate-pulse" />
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="mx-auto w-full max-w-4xl rounded-3xl border border-red-100 bg-red-50/80 p-6 text-center text-red-700 shadow-lg">
            Unable to generate route. Please tweak your inputs and try again.
          </div>
        )}

        {generatedGeometry && data && !loading && (
          <div className="mx-auto w-full max-w-5xl space-y-4 rounded-3xl border border-blue-100 bg-white/80 p-8 shadow-2xl">
            <div className="flex flex-wrap items-baseline gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-500">
                  Preview
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  Custom route ready
                </h2>
              </div>
              <div className="flex gap-6 text-sm text-gray-600">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Distance
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {previewDistance ? previewDistance.toFixed(1) : "--"} mi
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Duration
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {previewDuration ? Math.round(previewDuration) : "--"} min
                  </p>
                </div>
              </div>
            </div>
            <div className="h-96 overflow-hidden rounded-3xl shadow-xl ring-1 ring-blue-100">
              <GeneratedRouteMap geometry={generatedGeometry} />
            </div>
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
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="rounded-2xl bg-white/90">
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


