"use client";

import { Cloud, CloudRain, CloudSnow, Sun, Wind, Cloudy } from "lucide-react";

interface WeatherCardProps {
  temperature: number | null;
  condition: string | null;
  wind: number | null;
  loading: boolean;
}

// Map weather codes to human-readable text
// Based on WMO Weather interpretation codes (WW)
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

// Get weather icon based on condition
function getWeatherIcon(condition: string | null) {
  if (!condition) return <Sun className="h-8 w-8 text-yellow-500" />;
  
  const lowerCondition = condition.toLowerCase();
  
  if (lowerCondition.includes("clear") || lowerCondition.includes("mainly clear")) {
    return <Sun className="h-8 w-8 text-yellow-500" />;
  }
  if (lowerCondition.includes("cloudy") || lowerCondition.includes("overcast")) {
    return <Cloudy className="h-8 w-8 text-gray-500" />;
  }
  if (lowerCondition.includes("rain") || lowerCondition.includes("drizzle")) {
    return <CloudRain className="h-8 w-8 text-blue-500" />;
  }
  if (lowerCondition.includes("snow")) {
    return <CloudSnow className="h-8 w-8 text-blue-300" />;
  }
  if (lowerCondition.includes("fog")) {
    return <Cloud className="h-8 w-8 text-gray-400" />;
  }
  
  return <Sun className="h-8 w-8 text-yellow-500" />;
}

// Convert weather code to human-readable text
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
      <div className="rounded-xl bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-md p-4 shadow-md border border-gray-100/50">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (temperature === null || condition === null) {
    return null;
  }

  const tempF = Math.round(temperature);
  const windMph = wind !== null ? Math.round(wind * 0.621371) : null; // Convert km/h to mph

  return (
    <div className="rounded-xl bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-md p-4 shadow-md border border-gray-100/50">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {getWeatherIcon(condition)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl font-bold text-gray-900">
              {tempF}°F
            </span>
            <span className="text-sm text-gray-600">— {condition}</span>
          </div>
          {windMph !== null && (
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <Wind className="h-4 w-4" />
              <span>Wind: {windMph} mph</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

