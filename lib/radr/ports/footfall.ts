/**
 * FootfallProvider - vendor-agnostic area activity signal.
 * Do NOT scrape Google Popular Times. Only supported APIs / third parties /
 * open mobility / internal history behind this port.
 */

export type FootfallSource =
  | "internal_history"
  | "event_feed"
  | "open_mobility"
  | "third_party"
  | "google_supported"
  | "illustrative";

export type AreaFootfallEstimate = {
  locationId: string;
  asOf: string;
  horizonLabel: string;
  /** Estimated people moving through catchment in the service window. */
  estimatedPeople: number;
  /** Historical venue walk-in conversion (0-1). Null when insufficient data. */
  historicalConversionRate: number | null;
  source: FootfallSource;
  confidence: "low" | "medium" | "high";
  notes: string[];
};

export type FootfallProvider = {
  id: string;
  estimateAreaFootfall(input: {
    locationId: string;
    asOf: string;
    serviceStartIso: string;
    serviceEndIso: string;
  }): AreaFootfallEstimate | null;
};

/** Demo provider - illustrative only, not a live Google/Places scrape. */
export const demoFootfallProvider: FootfallProvider = {
  id: "demo_internal_history",
  estimateAreaFootfall({ locationId, asOf }) {
    if (locationId !== "loc_ber") return null;
    return {
      locationId,
      asOf,
      horizonLabel: "Dinner window",
      estimatedPeople: 4800,
      historicalConversionRate: 0.0054,
      source: "illustrative",
      confidence: "medium",
      notes: [
        "Built from internal walk-in history + event attendance proxy.",
        "No undocumented Google busyness fields.",
      ],
    };
  },
};
