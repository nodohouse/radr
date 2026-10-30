/**
 * Widget configuration — visualization, scope, period, comparison.
 * Stored on DashboardWidget.config and edited in the Builder inspector.
 */

import type { DashboardWidgetConfig } from "@/lib/product/dashboards";
import { CATEGORY_MODULES, isNativeWidget } from "@/lib/product/dashboardBuilder";

export type WidgetVisualization =
  | "kpi"
  | "line"
  | "area"
  | "bar"
  | "stacked"
  | "donut"
  | "table"
  | "sparkline"
  | "list"
  | "heatmap"
  | "waterfall";

export type WidgetScopeMode = "inherit" | "all" | "location";
export type WidgetPeriodMode =
  | "inherit"
  | "today"
  | "yesterday"
  | "wtd"
  | "mtd"
  | "ytd";
export type WidgetComparison = "none" | "plan" | "forecast" | "prior";

export type WidgetConfigFields = {
  title?: string;
  text?: string;
  visualization?: WidgetVisualization;
  scopeMode?: WidgetScopeMode;
  periodMode?: WidgetPeriodMode;
  comparison?: WidgetComparison;
  showVariance?: boolean;
  showLive?: boolean;
  compact?: boolean;
};

export function mergeWidgetConfig(
  current: DashboardWidgetConfig | undefined,
  patch: WidgetConfigFields,
): DashboardWidgetConfig | undefined {
  const next: WidgetConfigFields = { ...current, ...patch };
  for (const key of Object.keys(next) as (keyof WidgetConfigFields)[]) {
    const v = next[key];
    if (v === undefined || v === "") delete next[key];
  }
  return Object.keys(next).length ? (next as DashboardWidgetConfig) : undefined;
}

const LIST_MODULES = new Set([
  "builder_decisions",
  "builder_verified",
  "builder_memory",
  "top_dishes",
  "stock_watch",
]);

const KPI_MODULES = new Set([
  "money_flow",
  "revenue_pace_day",
  "revenue_pace_mtd",
  "labor_productivity",
  "location_exposure",
  "order_flow",
  "booking_pace",
]);

const WATERFALL_HINT = new Set([
  "settlement_bridge",
  "cost_movers",
  "menu_contribution",
]);

export function allowedVisualizations(
  moduleId: string,
): WidgetVisualization[] {
  if (moduleId === "builder_text") return ["kpi"];
  if (LIST_MODULES.has(moduleId) || moduleId.startsWith("builder_")) {
    return ["list", "table", "kpi"];
  }
  if (WATERFALL_HINT.has(moduleId)) {
    return ["waterfall", "bar", "stacked", "line", "kpi", "table"];
  }
  if (CATEGORY_MODULES.charts.includes(moduleId)) {
    return ["line", "area", "bar", "sparkline", "kpi", "table"];
  }
  if (KPI_MODULES.has(moduleId)) {
    return ["kpi", "sparkline", "line", "bar"];
  }
  if (isNativeWidget(moduleId)) return ["list", "kpi"];
  return ["line", "area", "bar", "kpi", "table", "donut"];
}

export function recommendedVisualization(
  moduleId: string,
): WidgetVisualization {
  if (LIST_MODULES.has(moduleId) || moduleId.startsWith("builder_")) return "list";
  if (WATERFALL_HINT.has(moduleId)) return "waterfall";
  if (CATEGORY_MODULES.charts.includes(moduleId)) return "line";
  if (KPI_MODULES.has(moduleId)) return "kpi";
  if (moduleId === "builder_text") return "kpi";
  return "line";
}

export function visualizationLabel(v: WidgetVisualization): string {
  const map: Record<WidgetVisualization, string> = {
    kpi: "KPI",
    line: "Line",
    area: "Area",
    bar: "Bar",
    stacked: "Stacked bar",
    donut: "Donut",
    table: "Table",
    sparkline: "Sparkline",
    list: "List",
    heatmap: "Heatmap",
    waterfall: "Waterfall",
  };
  return map[v];
}

export function effectiveVisualization(
  moduleId: string,
  config?: DashboardWidgetConfig,
): WidgetVisualization {
  const allowed = allowedVisualizations(moduleId);
  const chosen = config?.visualization;
  if (chosen && allowed.includes(chosen)) return chosen;
  return recommendedVisualization(moduleId);
}

export function chartRecommendation(
  moduleId: string,
  current: WidgetVisualization,
): string | null {
  const rec = recommendedVisualization(moduleId);
  if (rec === current) return null;
  if (rec === "waterfall") {
    return "Waterfall is more appropriate because this metric explains contribution drivers.";
  }
  if (rec === "list" && current === "donut") {
    return "A list fits decision and inventory widgets better than a chart.";
  }
  if (rec === "kpi" && (current === "heatmap" || current === "donut")) {
    return "KPI is clearer for a single operating number.";
  }
  if (rec === "line" && current === "donut") {
    return "A line chart shows pace over time more clearly than a donut.";
  }
  return `${visualizationLabel(rec)} is the recommended view for this metric.`;
}

export const SCOPE_OPTIONS: { id: WidgetScopeMode; label: string }[] = [
  { id: "inherit", label: "Follow dashboard" },
  { id: "all", label: "All locations" },
  { id: "location", label: "Current location" },
];

export const PERIOD_OPTIONS: { id: WidgetPeriodMode; label: string }[] = [
  { id: "inherit", label: "Follow dashboard" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "wtd", label: "WTD" },
  { id: "mtd", label: "MTD" },
  { id: "ytd", label: "YTD" },
];

export const COMPARISON_OPTIONS: { id: WidgetComparison; label: string }[] = [
  { id: "none", label: "None" },
  { id: "plan", label: "vs Plan" },
  { id: "forecast", label: "vs Forecast" },
  { id: "prior", label: "vs Prior period" },
];
