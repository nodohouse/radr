/**
 * Weather becomes intelligence only when a vertical model connects it
 * to demand, labor, or money. No universal sunny=up / rain=down rule.
 */

import type { WeatherOperatingModel, WeatherSensitivityChannel } from "./types";

export const WEATHER_CHANNELS_BY_MODEL: Record<
  WeatherOperatingModel,
  WeatherSensitivityChannel[]
> = {
  restaurant: [
    "terrace_demand",
    "walk_ins",
    "delivery",
    "cancellations",
    "product_mix",
    "labor",
  ],
  hotel: [
    "leisure_bookings",
    "cancellations",
    "spa",
    "outdoor_facilities",
    "events",
    "housekeeping",
  ],
  bar_cafe: ["terrace_demand", "walk_ins", "product_mix", "events"],
  multi_location: ["terrace_demand", "walk_ins", "labor", "cancellations"],
};

export function weatherChannelsForModel(
  model: WeatherOperatingModel,
): WeatherSensitivityChannel[] {
  return WEATHER_CHANNELS_BY_MODEL[model];
}
