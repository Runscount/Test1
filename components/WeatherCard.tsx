"use client";

import { Cloud, CloudRain, CloudSnow, Sun, Wind, Cloudy } from "lucide-react";

interface WeatherCardProps {
  temperature: number | null;
  condition: string | null;
  wind: number | null;
  loading: boolean;
}

const weatherCodeMap: Record<number, string> = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function getWeatherIcon(condition: string | null) {
  if (!condition) return <Sun className="h-8 w-8 text-primary" />;

  const lowerCondition = condition.toLowerCase();

  if (lowerCondition.includes("clear")) {
    return <Sun className="h-8 w-8 text-primary" />;
  }
  if (lowerCondition.includes("cloudy") || lowerCondition.includes("overcast")) {
    return <Cloudy className="h-8 w-8 text-muted-foreground" />;
  }
  if (lowerCondition.includes("rain") || lowerCondition.includes("drizzle")) {
    return <CloudRain className="h-8 w-8 text-accent" />;
  }
  if (lowerCondition.includes("snow")) {
    return <CloudSnow className="h-8 w-8 text-accent" />;
  }
  if (lowerCondition.includes("fog")) {
    return <Cloud className="h-8 w-8 text-muted-foreground" />;
  }

  return <Sun className="h-8 w-8 text-primary" />;
}

export function getWeatherCondition(code: number | null): string {
  if (code === null || code === undefined) return "Unknown";
  return weatherCodeMap[code] || "Unknown";
}

export default function WeatherCard({
  temperature,
  condition,
  wind,
  loading,
}: WeatherCardProps) {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-24 rounded bg-muted animate-pulse" />
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (temperature === null || condition === null) {
    return null;
  }

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">{getWeatherIcon(condition)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl font-bold text-foreground">
              {temperature}°F
            </span>
            <span className="text-sm text-muted-foreground">— {condition}</span>
          </div>
          {wind !== null && (
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <Wind className="h-4 w-4" />
              <span>Wind: {wind} mph</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
