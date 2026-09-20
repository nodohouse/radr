/**
 * Weather as operating context - not a decorative widget.
 * Weather is not an insight until connected to an economic/operational consequence.
 */

export type WeatherCondition =
  | "clear"
  | "partly_cloudy"
  | "overcast"
  | "rain"
  | "heavy_rain"
  | "storm"
  | "snow"
  | "wind";

export type WeatherLocationRef = {
  locationId: string;
  timezone: string;
  /** Optional geo - weather is always location-scoped, never org-global. */
  city?: string;
  latitude?: number;
  longitude?: number;
};

export type CurrentConditions = {
  asOf: string;
  temperatureC: number;
  condition: WeatherCondition;
  precipitationProbabilityPct: number;
  precipitationMm: number;
  windKph: number;
  severe: boolean;
  summary: string;
};

export type HourlyForecast = {
  at: string;
  temperatureC: number;
  condition: WeatherCondition;
  precipitationProbabilityPct: number;
  precipitationMm: number;
  windKph: number;
};

export type DailyForecast = {
  date: string;
  highC: number;
  lowC: number;
  condition: WeatherCondition;
  precipitationProbabilityPct: number;
  precipitationMm: number;
  windKph: number;
  severe: boolean;
  summary: string;
};

export type WeatherProvider = {
  getCurrentConditions(location: WeatherLocationRef): CurrentConditions | null;
  getHourlyForecast(
    location: WeatherLocationRef,
    horizonHours: number,
  ): HourlyForecast[];
  getDailyForecast(
    location: WeatherLocationRef,
    horizonDays: number,
  ): DailyForecast[];
};

/** Vertical-specific sensitivity - detectors interpret, weather does not. */
export type WeatherOperatingModel =
  | "restaurant"
  | "hotel"
  | "bar_cafe"
  | "multi_location";

export type WeatherSensitivityChannel =
  | "terrace_demand"
  | "walk_ins"
  | "delivery"
  | "cancellations"
  | "product_mix"
  | "labor"
  | "leisure_bookings"
  | "spa"
  | "housekeeping"
  | "events"
  | "outdoor_facilities";
