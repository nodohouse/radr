/**
 * ExperienceComposer — compose Control Center / Location / Intelligence
 * from vertical × role × scope × temporal state.
 * One brain; different scenes. No 30 hardcoded dashboards.
 */

import type { RoleView } from "@/lib/product/types";
import {
  DEMO_LOCATIONS,
  normalizeLocationId,
  type DemoLocationId,
} from "@/lib/radr/product/demoOrg";
import { verticalForLocationId } from "@/lib/radr/demo/verticalScope";
import { demoServicePhaseAt } from "@/lib/radr/servicePhase";
import { DEMO_AS_OF_ISO } from "@/lib/radr/demoClock";

export type HospitalityVertical = "restaurant" | "hotel" | "apartment" | "group";

export type TemporalState =
  | "pre_shift"
  | "live_service"
  | "post_shift"
  | "morning_ops"
  | "turnover_window"
  | "day_ops"
  | "mtd";

export type ExperienceScope =
  | { kind: "group" }
  | { kind: "location"; locationId: DemoLocationId };

export type ExperienceContext = {
  vertical: HospitalityVertical;
  role: RoleView;
  scope: ExperienceScope;
  temporalState: TemporalState;
  period: "today" | "wtd" | "mtd" | "ytd";
  locationId: DemoLocationId | "all";
};

export type LiveSceneKind =
  | "restaurant_service"
  | "restaurant_tonight"
  | "restaurant_wrap"
  | "hotel_today"
  | "apartment_turnover"
  | "group_pulse";

export type LocationTabId =
  | "overview"
  | "today" // legacy alias → overview
  | "live"
  | "arrivals"
  | "turnovers"
  | "performance"
  | "distribution"
  | "channels"
  | "decisions"
  | "value"
  | "memory"
  | "data";

export function verticalOfLocation(locationId: string): HospitalityVertical {
  const n = normalizeLocationId(locationId);
  const v = verticalForLocationId(n);
  if (v === "restaurant") return "restaurant";
  if (v === "hotel") return "hotel";
  if (n === DEMO_LOCATIONS.chiado.id) return "apartment";
  if (n === DEMO_LOCATIONS.berlin.id) return "restaurant";
  if (n === DEMO_LOCATIONS.canal.id) return "hotel";
  return "group";
}

export function resolveExperienceContext(input: {
  role: RoleView;
  locationScope: string;
  period?: "today" | "wtd" | "mtd" | "ytd";
  asOfIso?: string;
}): ExperienceContext {
  const period = input.period ?? "mtd";
  const raw = input.locationScope;
  const isGroup =
    raw === "all" || raw.startsWith("region_") || raw === "loc_group";

  if (isGroup) {
    return {
      vertical: "group",
      role: input.role,
      scope: { kind: "group" },
      temporalState: period === "today" ? "day_ops" : "mtd",
      period,
      locationId: "all",
    };
  }

  const locationId = normalizeLocationId(raw) as DemoLocationId;
  const vertical = verticalOfLocation(locationId);
  const phaseCtx = demoServicePhaseAt(input.asOfIso ?? DEMO_AS_OF_ISO);
  let temporalState: TemporalState = "day_ops";

  if (vertical === "restaurant") {
    if (phaseCtx.phase === "LIVE" || phaseCtx.phase === "CLOSING") {
      temporalState = "live_service";
    } else if (phaseCtx.phase === "PRE_SHIFT") {
      temporalState = "pre_shift";
    } else if (phaseCtx.phase === "POST_SHIFT") {
      temporalState = "post_shift";
    } else {
      temporalState = "day_ops";
    }
  } else if (vertical === "hotel") {
    temporalState = "morning_ops";
  } else if (vertical === "apartment") {
    temporalState = "turnover_window";
  }

  return {
    vertical,
    role: input.role,
    scope: { kind: "location", locationId },
    temporalState,
    period,
    locationId,
  };
}

export function liveSceneFor(ctx: ExperienceContext): LiveSceneKind {
  if (ctx.vertical === "group") return "group_pulse";
  if (ctx.vertical === "hotel") return "hotel_today";
  if (ctx.vertical === "apartment") return "apartment_turnover";
  if (ctx.temporalState === "live_service") return "restaurant_service";
  if (ctx.temporalState === "post_shift") return "restaurant_wrap";
  return "restaurant_tonight";
}

export function locationTabsFor(
  vertical: HospitalityVertical,
): { id: LocationTabId; label: string }[] {
  if (vertical === "hotel") {
    return [
      { id: "overview", label: "Overview" },
      { id: "live", label: "Live" },
      { id: "performance", label: "Performance" },
      { id: "decisions", label: "Decisions" },
      { id: "value", label: "Value" },
      { id: "memory", label: "Memory" },
      { id: "data", label: "Data" },
    ];
  }
  if (vertical === "apartment") {
    return [
      { id: "overview", label: "Overview" },
      { id: "live", label: "Live" },
      { id: "performance", label: "Performance" },
      { id: "channels", label: "Channels" },
      { id: "decisions", label: "Decisions" },
      { id: "value", label: "Value" },
      { id: "memory", label: "Memory" },
      { id: "data", label: "Data" },
    ];
  }
  return [
    { id: "overview", label: "Overview" },
    { id: "live", label: "Live" },
    { id: "performance", label: "Performance" },
    { id: "decisions", label: "Decisions" },
    { id: "value", label: "Value" },
    { id: "memory", label: "Memory" },
    { id: "data", label: "Data" },
  ];
}

/** Intelligence overview module ids curated by context — not a full catalog dump. */
export function curatedIntelModuleIds(ctx: ExperienceContext): string[] {
  if (ctx.vertical === "hotel") {
    return [
      "occupancy_pace",
      "arrivals_today",
      "channel_mix",
      "housekeeping",
      "verified_value",
    ];
  }
  if (ctx.vertical === "apartment") {
    return [
      "turnover_board",
      "gap_nights",
      "channel_mix",
      "cleaning_sla",
      "verified_value",
    ];
  }
  if (ctx.role === "gm" || ctx.role === "head_chef" || ctx.role === "kitchen") {
    return [
      "live_service",
      "reservations",
      "kitchen_pressure",
      "top_dishes",
      "labor_match",
    ];
  }
  if (ctx.role === "coo") {
    return [
      "portfolio",
      "labor_match",
      "supplier_variance",
      "kitchen_pressure",
      "verified_value",
      "channel_economics",
    ];
  }
  // CFO / finance / group default
  return [
    "contribution_bridge",
    "settlement",
    "supplier_variance",
    "portfolio",
    "verified_value",
    "channel_economics",
  ];
}

/** Control Center module ids — same system, role-prioritized order. */
export type CcModuleId =
  | "situation"
  | "handoff"
  | "live"
  | "nowNext"
  | "locations"
  | "menu"
  | "performance"
  | "pulse";

export type ControlCenterExperience = {
  ctx: ExperienceContext;
  moduleOrder: CcModuleId[];
  /** Short emphasis line under greeting — not a second status strip. */
  emphasis: string;
  /** Decision IDs to surface first in Review Now when present. */
  decisionPriorityIds: string[];
};

export function composeControlCenterExperience(input: {
  role: RoleView;
  locationScope: string;
  vertical: HospitalityVertical | "restaurant" | "hotel";
  period?: "today" | "wtd" | "mtd" | "ytd";
}): ControlCenterExperience {
  const ctx = resolveExperienceContext({
    role: input.role,
    locationScope: input.locationScope,
    period: input.period ?? "mtd",
  });

  const vertical =
    input.vertical === "hotel"
      ? "hotel"
      : ctx.vertical === "hotel"
        ? "hotel"
        : "restaurant";

  if (vertical === "hotel") {
    if (input.role === "cfo" || input.role === "finance" || input.role === "owner") {
      return {
        ctx: { ...ctx, vertical: "hotel" },
        moduleOrder: [
          "situation",
          "handoff",
          "pulse",
          "performance",
          "locations",
          "live",
          "nowNext",
          "menu",
        ],
        emphasis: "Contribution · channel mix · RevPAR · Verified Value",
        decisionPriorityIds: [
          "dec_ota_canal",
          "dec_hotel_readiness_canal",
        ],
      };
    }
    if (input.role === "revenue_manager") {
      return {
        ctx: { ...ctx, vertical: "hotel" },
        moduleOrder: [
          "pulse",
          "situation",
          "handoff",
          "locations",
          "performance",
          "live",
          "nowNext",
          "menu",
        ],
        emphasis: "Pace · pickup · soft dates · channel Decisions",
        decisionPriorityIds: [
          "dec_ota_canal",
          "dec_hotel_readiness_canal",
        ],
      };
    }
    if (input.role === "housekeeping_manager") {
      return {
        ctx: { ...ctx, vertical: "hotel" },
        moduleOrder: [
          "live",
          "nowNext",
          "handoff",
          "situation",
          "locations",
          "pulse",
          "performance",
          "menu",
        ],
        emphasis: "Dirty → clean → inspect · arrival readiness",
        decisionPriorityIds: [
          "dec_hotel_readiness_canal",
        ],
      };
    }
    if (input.role === "coo" || input.role === "regional") {
      return {
        ctx: { ...ctx, vertical: "hotel" },
        moduleOrder: [
          "handoff",
          "situation",
          "locations",
          "live",
          "nowNext",
          "pulse",
          "performance",
          "menu",
        ],
        emphasis: "Estate readiness · arrival waves · OOO",
        decisionPriorityIds: [
          "dec_hotel_readiness_canal",
          "dec_ota_canal",
        ],
      };
    }
    return {
      ctx: { ...ctx, vertical: "hotel" },
      moduleOrder: [
        "situation",
        "handoff",
        "live",
        "nowNext",
        "locations",
        "pulse",
        "performance",
        "menu",
      ],
      emphasis: "Readiness · pickup · rooms at risk",
      decisionPriorityIds: [
        "dec_hotel_readiness_canal",
        "dec_ota_canal",
      ],
    };
  }

  if (input.role === "cfo" || input.role === "finance" || input.role === "owner") {
    return {
      ctx,
      moduleOrder: [
        "situation",
        "handoff",
        "pulse",
        "performance",
        "locations",
        "live",
        "menu",
        "nowNext",
      ],
      emphasis: "Contribution · Verified Value · exposure",
      decisionPriorityIds: [
        "dec_margin_coke_berlin",
        "dec_supplier_berlin",
        "dec_peak_berlin",
      ],
    };
  }

  if (input.role === "coo" || input.role === "regional") {
    return {
      ctx,
      moduleOrder: [
        "handoff",
        "situation",
        "locations",
        "pulse",
        "live",
        "menu",
        "nowNext",
        "performance",
      ],
      emphasis: "Estate exceptions · labor · procurement · Decision throughput",
      decisionPriorityIds: [
        "dec_labor_berlin",
        "dec_peak_berlin",
        "dec_margin_coke_berlin",
        "dec_caster_sugar_berlin",
      ],
    };
  }

  if (input.role === "head_chef" || input.role === "kitchen") {
    return {
      ctx,
      moduleOrder: [
        "live",
        "nowNext",
        "menu",
        "handoff",
        "situation",
        "locations",
        "pulse",
        "performance",
      ],
      emphasis: "Prep · stock · station pressure · kitchen Decisions",
      decisionPriorityIds: [
        "dec_caster_sugar_berlin",
        "dec_tuna_berlin",
        "dec_peak_berlin",
      ],
    };
  }

  if (
    input.role === "fb_operator" ||
    input.role === "host" ||
    input.role === "server"
  ) {
    return {
      ctx,
      moduleOrder: [
        "live",
        "nowNext",
        "handoff",
        "situation",
        "menu",
        "locations",
        "pulse",
        "performance",
      ],
      emphasis: "Bookings · turns · waitlist · recoverable revenue",
      decisionPriorityIds: [
        "dec_peak_berlin",
        "dec_table_recover_berlin",
        "dec_margin_coke_berlin",
      ],
    };
  }

  // GM default — NOW / service / BOH
  return {
    ctx,
    moduleOrder: [
      "situation",
      "handoff",
      "live",
      "nowNext",
      "menu",
      "locations",
      "pulse",
      "performance",
    ],
    emphasis: "Service · team · stock · local Decisions",
    decisionPriorityIds: [
      "dec_peak_berlin",
      "dec_caster_sugar_berlin",
      "dec_margin_coke_berlin",
    ],
  };
}

/** Sort Needs You rows by ExperienceComposer decision priority. */
export function prioritizeNeedsYouIds<T extends { id: string }>(
  rows: T[],
  priorityIds: string[],
): T[] {
  const rank = new Map(priorityIds.map((id, i) => [id, i]));
  return [...rows].sort((a, b) => {
    const ra = rank.has(a.id) ? rank.get(a.id)! : 1000;
    const rb = rank.has(b.id) ? rank.get(b.id)! : 1000;
    return ra - rb;
  });
}
