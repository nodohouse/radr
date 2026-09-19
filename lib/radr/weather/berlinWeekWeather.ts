/**
 * Berlin demo week weather — drives terrace open/closed and cover math.
 * Service day picker uses this so rain days close the terrace for real.
 */

import type { DailyForecast, WeatherCondition } from "@/lib/radr/weather/types";
import { BERLIN_DEMO_TONIGHT } from "@/lib/radr/berlinWeekRoster";

export type TerraceWeatherDecision = "OPEN" | "LIMITED" | "CLOSED";

export type BerlinDayWeatherOps = {
  dateIso: string;
  forecast: DailyForecast;
  terrace: TerraceWeatherDecision;
  /** Expected terrace covers tonight/that service (0 when closed) */
  terraceExpectedCovers: number;
  /** Typical warm-dry terrace covers for counterfactual */
  terraceTypicalCovers: number;
  /** Covers lost vs typical when weather hurts */
  terraceCoversVsTypical: number;
  /** Contribution € at stake from terrace weather */
  contributionEuro: number;
  /** One-line ops cue for FOH */
  opsCue: string;
  /** Why terrace decision */
  reason: string;
};

const CONTRIBUTION_PER_COVER = 30;
const TYPICAL_TERRACE = 36;

function day(
  dateIso: string,
  highC: number,
  lowC: number,
  condition: WeatherCondition,
  rainPct: number,
  precipMm: number,
  summary: string,
  terrace: TerraceWeatherDecision,
  terraceExpected: number,
  opsCue: string,
  reason: string,
): BerlinDayWeatherOps {
  const vs = terraceExpected - TYPICAL_TERRACE;
  return {
    dateIso,
    forecast: {
      date: dateIso,
      highC,
      lowC,
      condition,
      precipitationProbabilityPct: rainPct,
      precipitationMm: precipMm,
      windKph: condition === "heavy_rain" ? 28 : condition === "rain" ? 18 : 10,
      severe: condition === "heavy_rain",
      summary,
    },
    terrace,
    terraceExpectedCovers: terraceExpected,
    terraceTypicalCovers: TYPICAL_TERRACE,
    terraceCoversVsTypical: vs,
    contributionEuro: Math.round(vs * CONTRIBUTION_PER_COVER),
    opsCue,
    reason,
  };
}

/** Demo week Mon 14 → Sun 20 Sep 2026 */
const WEEK: Record<string, BerlinDayWeatherOps> = {
  "2026-09-14": day(
    "2026-09-14",
    23,
    16,
    "partly_cloudy",
    15,
    0,
    "Mild, mostly dry",
    "OPEN",
    38,
    "Terrace open · walk-ins welcome",
    "Dry enough to run full terrace",
  ),
  "2026-09-15": day(
    "2026-09-15",
    26,
    17,
    "clear",
    8,
    0,
    "Warm and dry",
    "OPEN",
    48,
    "Terrace +12 vs typical · peak demand",
    "Warm dry lift — protect outdoor capacity",
  ),
  /** The rain day — terrace closed, math flips negative */
  "2026-09-16": day(
    "2026-09-16",
    17,
    12,
    "heavy_rain",
    92,
    18,
    "Heavy rain all service",
    "CLOSED",
    0,
    "Terrace closed · −36 covers · push indoor + bar",
    "Sustained rain — outdoor seats unusable; absorb walk-ins at bar",
  ),
  "2026-09-17": day(
    "2026-09-17",
    19,
    13,
    "rain",
    55,
    4,
    "Showers, damp evening",
    "LIMITED",
    16,
    "Terrace limited · heaters + half capacity",
    "Wet furniture / intermittent rain — run half terrace only",
  ),
  "2026-09-18": day(
    "2026-09-18",
    24,
    15,
    "partly_cloudy",
    20,
    0,
    "Clearing, pleasant",
    "OPEN",
    40,
    "Terrace open · recovering after rain week",
    "Dry window returns",
  ),
  "2026-09-19": day(
    "2026-09-19",
    27,
    18,
    "clear",
    5,
    0,
    "Warm Saturday",
    "OPEN",
    52,
    "Terrace full set · Saturday peak",
    "Peak outdoor demand",
  ),
  "2026-09-20": day(
    "2026-09-20",
    18,
    12,
    "rain",
    70,
    8,
    "Cool rain, Sunday soft",
    "CLOSED",
    0,
    "Terrace closed · Sunday rain · lighter house",
    "Rain + soft Sunday — do not staff outdoor",
  ),
};

export function berlinWeatherForDate(
  dateIso: string = BERLIN_DEMO_TONIGHT,
): BerlinDayWeatherOps {
  return WEEK[dateIso] ?? WEEK[BERLIN_DEMO_TONIGHT]!;
}

export function berlinTerraceClosed(dateIso: string): boolean {
  return berlinWeatherForDate(dateIso).terrace === "CLOSED";
}

export function berlinTerraceLimited(dateIso: string): boolean {
  return berlinWeatherForDate(dateIso).terrace === "LIMITED";
}

/** Quiet mark for the week strip — surface weather without a click. */
export type WeekWeatherMark = "heavy_rain" | "rain" | "fair" | "warm";

export function berlinWeekWeatherMark(dateIso: string): WeekWeatherMark {
  const ops = berlinWeatherForDate(dateIso);
  const c = ops.forecast.condition;
  if (c === "heavy_rain" || c === "storm") return "heavy_rain";
  if (c === "rain" || ops.terrace === "CLOSED" || ops.terrace === "LIMITED") {
    return "rain";
  }
  if (c === "clear" && ops.forecast.highC >= 25) return "warm";
  return "fair";
}

export function berlinWeekWeatherTitle(dateIso: string): string {
  const ops = berlinWeatherForDate(dateIso);
  const mark = berlinWeekWeatherMark(dateIso);
  const wx =
    mark === "heavy_rain"
      ? "Heavy rain · terrace closed"
      : mark === "rain"
        ? `${ops.forecast.summary} · terrace ${ops.terrace.toLowerCase()}`
        : `${ops.forecast.highC}°C · ${ops.forecast.summary}`;
  return wx;
}

export const BERLIN_WEATHER_CONTRIBUTION_PER_COVER = CONTRIBUTION_PER_COVER;
