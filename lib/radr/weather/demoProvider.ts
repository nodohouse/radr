/**
 * Deterministic fictional weather for DEMO.
 * Replace with a server-side live adapter; never put API keys in the client.
 */

import {
  DEMO_AS_OF_ISO,
  DEMO_BUSINESS_DATE,
  DEMO_LOCATION_ID,
  DEMO_TOMORROW_DATE,
  isoOnDemoDate,
} from "@/lib/radr/demoClock";
import type {
  CurrentConditions,
  DailyForecast,
  HourlyForecast,
  WeatherLocationRef,
  WeatherProvider,
} from "./types";

const BERLIN: WeatherLocationRef = {
  locationId: DEMO_LOCATION_ID,
  timezone: "Europe/Berlin",
  city: "Berlin",
  latitude: 52.52,
  longitude: 13.405,
};

const CURRENT: CurrentConditions = {
  asOf: DEMO_AS_OF_ISO,
  temperatureC: 22,
  condition: "partly_cloudy",
  precipitationProbabilityPct: 15,
  precipitationMm: 0,
  windKph: 12,
  severe: false,
  summary: "Mild evening, dry",
};

const TOMORROW: DailyForecast = {
  date: DEMO_TOMORROW_DATE,
  highC: 29,
  lowC: 18,
  condition: "clear",
  precipitationProbabilityPct: 10,
  precipitationMm: 0,
  windKph: 8,
  severe: false,
  summary: "Warm and dry",
};

function hourlyForTomorrow(): HourlyForecast[] {
  const hours = [11, 12, 13, 14, 15, 16, 17];
  return hours.map((h) => ({
    at: isoOnDemoDate(DEMO_TOMORROW_DATE, `${String(h).padStart(2, "0")}:00`),
    temperatureC: h >= 13 && h <= 15 ? 29 : 26 + Math.min(h - 11, 3),
    condition: "clear" as const,
    precipitationProbabilityPct: 10,
    precipitationMm: 0,
    windKph: 8,
  }));
}

export const demoWeatherProvider: WeatherProvider = {
  getCurrentConditions(location) {
    if (location.locationId !== BERLIN.locationId) return null;
    return CURRENT;
  },
  getHourlyForecast(location, horizonHours) {
    if (location.locationId !== BERLIN.locationId) return [];
    return hourlyForTomorrow().slice(0, Math.max(1, horizonHours));
  },
  getDailyForecast(location, horizonDays) {
    if (location.locationId !== BERLIN.locationId) return [];
    const days: DailyForecast[] = [
      {
        date: DEMO_BUSINESS_DATE,
        highC: 23,
        lowC: 16,
        condition: "partly_cloudy",
        precipitationProbabilityPct: 20,
        precipitationMm: 0,
        windKph: 12,
        severe: false,
        summary: "Mild, mostly dry",
      },
      TOMORROW,
    ];
    return days.slice(0, Math.max(1, horizonDays));
  },
};

export function berlinTomorrowWeather(): DailyForecast {
  return TOMORROW;
}

export function berlinWeatherLocation(): WeatherLocationRef {
  return BERLIN;
}
