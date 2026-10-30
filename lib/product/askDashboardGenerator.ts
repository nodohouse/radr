/**
 * Ask RADR → dashboard draft (deterministic).
 * Parses a natural-language operating request into name + widgets.
 * No LLM required for the demo — keyword rules map to canonical modules.
 * Vertical-aware: hotel prompts never emit restaurant-only widgets.
 */

import {
  createEmptyDashboard,
  newWidget,
  saveDashboard,
  type DashboardWidget,
  type RadrDashboard,
} from "@/lib/product/dashboards";
import { defaultDims } from "@/lib/product/dashboardBuilder";
import { normalizeLayout } from "@/lib/product/dashboardLayout";
import {
  recommendedVisualization,
  type WidgetVisualization,
} from "@/lib/product/dashboardWidgetConfig";

export type AskVertical = "restaurant" | "hotel";

export type AskDashboardDraft = {
  name: string;
  description: string;
  roleTemplate: string | null;
  moduleIds: string[];
  matchedHints: string[];
  prompt: string;
};

export const ASK_DASHBOARD_STARTERS = [
  "Build a CFO dashboard for this month.",
  "Show me Friday dinner performance.",
  "Build a Head Chef view for tonight.",
  "Create a view for weekly group review.",
  "Show labor and revenue together.",
  "Create a dashboard for underperforming locations.",
  "Build me a CFO view showing contribution, labor, exposure and Verified Value.",
  "Create a Friday dinner dashboard focused on bookings, kitchen pressure, guest recovery and staff.",
] as const;

export const ASK_HOTEL_DASHBOARD_STARTERS = [
  "Build me a hotel CFO dashboard for all properties this month.",
  "Create a Revenue Manager view for the next 30 days.",
  "Show me a GM morning dashboard for Amsterdam Centrum.",
  "Build a housekeeping dashboard focused on room readiness before 3pm.",
  "Create a Front Office view for today’s arrivals and upgrades.",
  "Show properties where occupancy is ahead but RevPAR is behind.",
  "Build a portfolio dashboard comparing OTA cost and contribution.",
  "Create a Hotel Operations view for arrivals and readiness today.",
] as const;

export function askDashboardStarters(
  vertical: AskVertical,
): readonly string[] {
  return vertical === "hotel"
    ? ASK_HOTEL_DASHBOARD_STARTERS
    : ASK_DASHBOARD_STARTERS;
}

type Rule = {
  id: string;
  match: RegExp;
  modules: string[];
  role?: string;
  nameHint?: string;
};

const RESTAURANT_RULES: Rule[] = [
  {
    id: "cfo",
    match:
      /\b(cfo|finance|contribution|verified value|settlement|exposure|cost movers|p&l|margin)\b/i,
    modules: [
      "revenue_vs_forecast",
      "verified_value_trend",
      "settlement_bridge",
      "location_exposure",
      "cost_movers",
      "builder_decisions",
    ],
    role: "cfo",
    nameHint: "CFO",
  },
  {
    id: "chef",
    match: /\b(chef|kitchen|prep|stock|waste|ticket|kds)\b/i,
    modules: [
      "kitchen_pressure",
      "top_dishes",
      "stock_watch",
      "live_service",
      "builder_decisions",
    ],
    role: "chef",
    nameHint: "Head Chef",
  },
  {
    id: "friday",
    match: /\b(friday|dinner|peak|tonight|service pressure|covers)\b/i,
    modules: [
      "live_service",
      "booking_pace",
      "kitchen_pressure",
      "top_dishes",
      "labor_productivity",
      "builder_decisions",
    ],
    role: "gm",
    nameHint: "Friday Dinner",
  },
  {
    id: "labor_revenue",
    match:
      /\b(labor|staff|staffing).{0,40}(revenue|sales)|((revenue|sales).{0,40}(labor|staff))\b/i,
    modules: [
      "revenue_vs_forecast",
      "labor_productivity",
      "live_service",
      "builder_decisions",
    ],
    role: "gm",
    nameHint: "Labor & Revenue",
  },
  {
    id: "underperform",
    match:
      /\b(underperform|gap|weak|exposure|portfolio|location health|exceptions)\b/i,
    modules: [
      "location_exposure",
      "revenue_pace_mtd",
      "cost_movers",
      "builder_decisions",
      "verified_value_trend",
    ],
    role: "coo",
    nameHint: "Location Performance",
  },
  {
    id: "group_review",
    match: /\b(group|weekly|board|review|portfolio|coo)\b/i,
    modules: [
      "location_exposure",
      "revenue_pace_mtd",
      "verified_value_trend",
      "builder_decisions",
      "cancellation_intel",
    ],
    role: "coo",
    nameHint: "Weekly Group Review",
  },
  {
    id: "gm",
    match: /\b(gm|general manager|operating|service pace|reservations?)\b/i,
    modules: [
      "live_service",
      "revenue_vs_forecast",
      "booking_pace",
      "labor_productivity",
      "builder_decisions",
    ],
    role: "gm",
    nameHint: "General Manager",
  },
];

const HOTEL_RULES: Rule[] = [
  {
    id: "hotel_cfo",
    match:
      /\b(cfo|finance|contribution|gop|channel cost|ota cost|verified value|exposure|margin|p&l)\b/i,
    modules: [
      "revenue_vs_forecast",
      "verified_value_trend",
      "hotel_occ_adr_revpar",
      "location_exposure",
      "hotel_channel_mix",
      "cost_movers",
      "builder_decisions",
    ],
    role: "cfo",
    nameHint: "Hotel CFO",
  },
  {
    id: "hotel_revenue",
    match:
      /\b(revenue manager|revpar|adr|pickup|pace|booking curve|rate|inventory|ota|channel mix|30\s*d|90\s*d)\b/i,
    modules: [
      "hotel_pickup",
      "hotel_channel_mix",
      "hotel_occ_adr_revpar",
      "hotel_cancellation",
      "event_context",
      "builder_decisions",
    ],
    role: "revenue_manager",
    nameHint: "Revenue Manager",
  },
  {
    id: "hotel_hk",
    match:
      /\b(housekeeping|room readiness|rooms? to clean|attendant|dirty|inspected|ooo|oos|before 3)\b/i,
    modules: [
      "room_readiness",
      "hk_productivity",
      "hotel_pickup",
      "builder_decisions",
      "labor_productivity",
    ],
    role: "housekeeping_manager",
    nameHint: "Housekeeping",
  },
  {
    id: "hotel_fo",
    match:
      /\b(front office|check-?in|arrivals?|vip|upgrade|queue|early arrival|late checkout)\b/i,
    modules: [
      "hotel_pickup",
      "room_readiness",
      "hotel_occ_adr_revpar",
      "builder_decisions",
    ],
    role: "front_office",
    nameHint: "Front Office",
  },
  {
    id: "hotel_brief",
    match: /\b(morning brief|overnight|what matters today|before arrivals)\b/i,
    modules: [
      "hotel_occ_adr_revpar",
      "room_readiness",
      "hotel_pickup",
      "event_context",
      "builder_decisions",
      "verified_value_trend",
    ],
    role: "hotel_gm",
    nameHint: "Morning Brief",
  },
  {
    id: "hotel_ops",
    match:
      /\b(hotel operations|ops|readiness|maintenance|front desk|arrivals? and|property readiness)\b/i,
    modules: [
      "room_readiness",
      "hotel_pickup",
      "hk_productivity",
      "hotel_occ_adr_revpar",
      "builder_decisions",
    ],
    role: "hotel_ops",
    nameHint: "Hotel Operations",
  },
  {
    id: "hotel_portfolio",
    match:
      /\b(portfolio|all properties|property health|group|owner|asset)\b/i,
    modules: [
      "location_exposure",
      "hotel_occ_adr_revpar",
      "verified_value_trend",
      "hotel_channel_mix",
      "builder_decisions",
      "revenue_vs_forecast",
    ],
    role: "coo",
    nameHint: "Portfolio Performance",
  },
  {
    id: "hotel_gm",
    match: /\b(gm|general manager|property command|amsterdam|canal)\b/i,
    modules: [
      "hotel_occ_adr_revpar",
      "room_readiness",
      "hotel_pickup",
      "hotel_channel_mix",
      "builder_decisions",
      "verified_value_trend",
    ],
    role: "hotel_gm",
    nameHint: "Hotel General Manager",
  },
];

const RESTAURANT_KEYWORDS: { re: RegExp; id: string }[] = [
  { re: /\brevenue\b/i, id: "revenue_vs_forecast" },
  { re: /\b(verified value|value)\b/i, id: "verified_value_trend" },
  { re: /\b(settlement|ledger)\b/i, id: "settlement_bridge" },
  { re: /\b(exposure|portfolio)\b/i, id: "location_exposure" },
  { re: /\b(labor|staff|staffing)\b/i, id: "labor_productivity" },
  { re: /\b(kitchen|pressure)\b/i, id: "kitchen_pressure" },
  { re: /\b(booking|reservation|covers)\b/i, id: "booking_pace" },
  { re: /\b(menu|dishes|pulse)\b/i, id: "top_dishes" },
  { re: /\b(stock|inventory|prep)\b/i, id: "stock_watch" },
  { re: /\b(decision|needs you|judgment)\b/i, id: "builder_decisions" },
  { re: /\b(guest|recovery|cancellation)\b/i, id: "cancellation_intel" },
  { re: /\bcost\b/i, id: "cost_movers" },
  { re: /\blive\b/i, id: "live_service" },
];

const HOTEL_KEYWORDS: { re: RegExp; id: string }[] = [
  { re: /\b(revpar|occupancy|adr)\b/i, id: "hotel_occ_adr_revpar" },
  { re: /\b(pickup|pace|booking)\b/i, id: "hotel_pickup" },
  { re: /\b(room readiness|readiness|rooms? ready)\b/i, id: "room_readiness" },
  { re: /\b(housekeeping|attendant|hk)\b/i, id: "hk_productivity" },
  { re: /\b(ota|channel|direct share)\b/i, id: "hotel_channel_mix" },
  { re: /\b(cancel|no-?show)\b/i, id: "hotel_cancellation" },
  { re: /\b(event|concert|trade)\b/i, id: "event_context" },
  { re: /\b(weather)\b/i, id: "weather_context" },
  { re: /\b(verified value|value)\b/i, id: "verified_value_trend" },
  { re: /\b(exposure|portfolio|propert)\b/i, id: "location_exposure" },
  { re: /\b(revenue|forecast)\b/i, id: "revenue_vs_forecast" },
  { re: /\b(labor|staff)\b/i, id: "labor_productivity" },
  { re: /\b(decision|needs you|judgment)\b/i, id: "builder_decisions" },
  { re: /\bcost\b/i, id: "cost_movers" },
];

const HOTEL_DEFAULT_MODULES = [
  "hotel_occ_adr_revpar",
  "room_readiness",
  "builder_decisions",
  "verified_value_trend",
];

const RESTAURANT_DEFAULT_MODULES = [
  "live_service",
  "revenue_vs_forecast",
  "builder_decisions",
  "verified_value_trend",
];

function unique(ids: string[]): string[] {
  return [...new Set(ids)];
}

export function generateAskDashboardDraft(
  prompt: string,
  vertical: AskVertical = "restaurant",
): AskDashboardDraft {
  const text = prompt.trim();
  const matchedHints: string[] = [];
  const modules: string[] = [];
  let role: string | null = null;
  let nameHint = vertical === "hotel" ? "Hotel operating view" : "Operating view";

  const rules = vertical === "hotel" ? HOTEL_RULES : RESTAURANT_RULES;
  const keywords =
    vertical === "hotel" ? HOTEL_KEYWORDS : RESTAURANT_KEYWORDS;

  for (const rule of rules) {
    if (rule.match.test(text)) {
      matchedHints.push(rule.id);
      modules.push(...rule.modules);
      if (!role && rule.role) role = rule.role;
      if (rule.nameHint) nameHint = rule.nameHint;
    }
  }

  for (const kw of keywords) {
    if (kw.re.test(text)) {
      modules.push(kw.id);
      matchedHints.push(`kw:${kw.id}`);
    }
  }

  let moduleIds = unique(modules).slice(0, 8);
  if (moduleIds.length === 0) {
    moduleIds =
      vertical === "hotel"
        ? [...HOTEL_DEFAULT_MODULES]
        : [...RESTAURANT_DEFAULT_MODULES];
    matchedHints.push("default");
    nameHint = "Ask RADR view";
  }

  const name =
    vertical === "hotel"
      ? hotelNameFromPrompt(text, nameHint)
      : restaurantNameFromPrompt(text, nameHint);

  return {
    name,
    description: `Generated from Ask RADR: “${text.slice(0, 120)}${text.length > 120 ? "…" : ""}”`,
    roleTemplate: role,
    moduleIds,
    matchedHints: unique(matchedHints),
    prompt: text,
  };
}

function restaurantNameFromPrompt(text: string, nameHint: string): string {
  if (/\bfriday\b/i.test(text) && /\bdinner\b/i.test(text)) return "Friday Dinner";
  if (/\bcfo\b/i.test(text)) return "CFO";
  if (/\bchef\b/i.test(text)) return "Head Chef";
  if (/\bcoo\b/i.test(text) || /\bgroup\b/i.test(text)) return nameHint;
  return nameHint;
}

function hotelNameFromPrompt(text: string, nameHint: string): string {
  if (/\bmorning brief\b/i.test(text)) return "Morning Brief";
  if (/\bcfo\b/i.test(text)) return "Hotel CFO";
  if (/\brevenue manager\b/i.test(text) || /\brevpar\b/i.test(text))
    return "Revenue Manager";
  if (/\bhousekeeping\b/i.test(text)) return "Housekeeping";
  if (/\bfront office\b/i.test(text)) return "Front Office";
  if (/\bportfolio\b/i.test(text) || /\ball properties\b/i.test(text))
    return "Portfolio Performance";
  if (/\bgm\b/i.test(text) || /\bgeneral manager\b/i.test(text))
    return "Hotel General Manager";
  return nameHint;
}

function widgetsFromModules(moduleIds: string[]): DashboardWidget[] {
  const raw = moduleIds.map((moduleId, i) => {
    const dims = defaultDims(moduleId);
    const viz = recommendedVisualization(moduleId) as WidgetVisualization;
    const w = newWidget(moduleId, dims, {
      x: (i % 2) * 6,
      y: Math.floor(i / 2) * 2,
    });
    return {
      ...w,
      config: {
        visualization: viz,
        scopeMode: "inherit" as const,
        periodMode: "inherit" as const,
        showVariance: true,
      },
    };
  });
  return normalizeLayout(raw);
}

/** Create a persisted user dashboard from an Ask RADR prompt. */
export function createDashboardFromAsk(
  prompt: string,
  vertical: AskVertical = "restaurant",
): RadrDashboard {
  const draft = generateAskDashboardDraft(prompt, vertical);
  const dash = createEmptyDashboard(draft.name);
  const widgets = widgetsFromModules(draft.moduleIds);
  const next: RadrDashboard = {
    ...dash,
    description: draft.description,
    roleTemplate: draft.roleTemplate,
    widgets,
    updatedAt: new Date().toISOString(),
  };
  saveDashboard(next);
  return next;
}
