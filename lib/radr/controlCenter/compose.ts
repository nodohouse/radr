/**
 * Control Center composition from profile + role + phase.
 */

import type { HospitalityOperatingProfile } from "@/lib/radr/domain/hospitalityOperatingProfile";
import type { ControlCenterModule } from "@/lib/radr/domain/roleLens";
import type { Prediction } from "@/lib/radr/domain/intelligence";
import type { HiddenSignal } from "@/lib/radr/domain/hiddenSignal";
import { modulesForRole, roleLensFor } from "@/lib/radr/role/lenses";
import { metricsForRole } from "@/lib/radr/metrics/catalog";
import type { DemoVertical } from "@/lib/radr/operating/resolveProfile";
import type { RoleView } from "@/lib/product/types";
import {
  rankHiddenSignalsForCockpit,
  rankHiddenSignalsForInsights,
  type CockpitHorizonFilter,
} from "@/lib/radr/hiddenSignals/rank";

export type ControlCenterSurface =
  | "restaurant_glance"
  | "hotel_glance"
  | "residences_glance"
  | "fleet";

export type ComposedControlCenter = {
  surface: ControlCenterSurface;
  modules: ControlCenterModule[];
  metricIds: string[];
  predictionTypes: string[];
  primaryResponsibility: string;
  hideHealthyNoise: boolean;
  maxAttention: number;
  /** Live / timely hidden signals (budgeted). */
  cockpitHiddenSignals: HiddenSignal[];
  /** Structural / monthly — Insights, not attention budget. */
  insightHiddenSignals: HiddenSignal[];
};

/** Prefer profile id; demo vertical is ignored when profile already identifies the vertical. */
export function surfaceForProfile(
  profile: HospitalityOperatingProfile,
  role: RoleView,
  _vertical?: DemoVertical,
): ControlCenterSurface {
  const id = profile.id;
  if (id === "boutique_hotel" || id === "hotel") return "hotel_glance";
  if (id === "serviced_apartments" || id === "vacation_rental") {
    return "residences_glance";
  }

  if (
    role === "cfo" ||
    role === "finance" ||
    role === "owner" ||
    role === "coo" ||
    role === "regional"
  ) {
    return "fleet";
  }
  return "restaurant_glance";
}

/** @deprecated Prefer surfaceForProfile — kept for call sites still on DemoVertical. */
export function surfaceForVertical(
  vertical: DemoVertical,
  role: RoleView,
): ControlCenterSurface {
  const profile =
    vertical === "boutique_hotel"
      ? ({ id: "boutique_hotel" } as HospitalityOperatingProfile)
      : vertical === "serviced_apartments"
        ? ({ id: "serviced_apartments" } as HospitalityOperatingProfile)
        : ({ id: "restaurant_full_service" } as HospitalityOperatingProfile);
  return surfaceForProfile(profile, role, vertical);
}

export function composeControlCenter(input: {
  profile: HospitalityOperatingProfile;
  role: RoleView;
  vertical: DemoVertical;
  phase?: string | null;
  predictions?: Prediction[];
  whenHorizon?: CockpitHorizonFilter;
}): ComposedControlCenter {
  const lens = roleLensFor(input.role, input.profile.id);
  const modules =
    lens?.controlCenterModules ??
    modulesForRole(input.role, input.profile.id);
  const metrics = metricsForRole(input.profile.id, input.role);
  const resolvedSurface = surfaceForProfile(
    input.profile,
    input.role,
    input.vertical,
  );

  const predictionTypes = lens?.predictionTypes ?? [];
  const filteredPredictions = (input.predictions ?? []).filter(
    (p) =>
      predictionTypes.length === 0 ||
      predictionTypes.includes(p.type) ||
      p.visibleToRoles.includes(input.role),
  );

  const maxAttention = 3;
  const cockpitHiddenSignals = rankHiddenSignalsForCockpit({
    vertical: input.vertical,
    whenHorizon: input.whenHorizon ?? "TODAY",
    maxAttention,
  });
  const insightHiddenSignals = rankHiddenSignalsForInsights({
    vertical: input.vertical,
    max: 6,
  });

  return {
    surface: resolvedSurface,
    modules:
      modules.length > 0
        ? modules
        : defaultModulesForSurface(resolvedSurface),
    metricIds: lens?.metricIds?.length
      ? lens.metricIds
      : metrics.map((m) => m.id),
    predictionTypes:
      filteredPredictions.length > 0
        ? [...new Set(filteredPredictions.map((p) => p.type))]
        : predictionTypes,
    primaryResponsibility:
      lens?.primaryResponsibility ?? "Understand what needs you",
    hideHealthyNoise: true,
    maxAttention,
    cockpitHiddenSignals,
    insightHiddenSignals,
  };
}

function defaultModulesForSurface(
  surface: ControlCenterSurface,
): ControlCenterModule[] {
  switch (surface) {
    case "hotel_glance":
      return [
        "house_brief",
        "overnight",
        "in_house",
        "attention",
        "handling",
        "predictions",
      ];
    case "residences_glance":
      return [
        "house_brief",
        "turnover_board",
        "attention",
        "orphan_nights",
        "predictions",
      ];
    case "fleet":
      return ["fleet_health", "contribution", "attention"];
    default:
      return ["pre_shift", "attention", "handling"];
  }
}

export function moduleEnabled(
  composed: ComposedControlCenter,
  module: ControlCenterModule,
): boolean {
  return composed.modules.includes(module);
}
