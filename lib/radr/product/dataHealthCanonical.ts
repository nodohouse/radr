/**
 * Canonical Data Health — aligned with Connections vendor fixtures.
 * Freshness · completeness · conflict · Decision impact.
 * No decorative confidence multipliers in the UI.
 */

import type { RoleView } from "@/lib/product/types";
import {
  ALL_SOURCES,
  sourcesForDemo,
  sourceIssueSummary,
  type SourceHealthRow,
} from "@/lib/radr/product/integrations";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";

export type DataHealthDimension = {
  freshness: "High" | "Medium" | "Low";
  completeness: "High" | "Medium" | "Low" | "Partial";
  conflict: string;
  decisionImpact: string;
};

export type DataHealthRow = SourceHealthRow & DataHealthDimension & {
  unhealthy: boolean;
  relatedDecisions: { id: string; label: string }[];
};

function relatedFor(row: SourceHealthRow): { id: string; label: string }[] {
  if (row.id === "deliverect") {
    return [
      { id: "dec_peak_berlin", label: "D-1911" },
      { id: "dec_menu_peak_berlin", label: "Channel contribution" },
    ];
  }
  if (row.id === "xero") {
    return [{ id: "dec_supplier_berlin", label: "D-4102" }];
  }
  return [];
}

function dimensionsFor(row: SourceHealthRow): DataHealthDimension {
  if (row.status === "STALE") {
    return {
      freshness: "Low",
      completeness: row.id === "xero" ? "Partial" : "High",
      conflict:
        row.id === "xero" ? "POS ↔ ledger timing" : "None",
      decisionImpact:
        row.impact ??
        (row.id === "xero"
          ? "Settlement evidence provisional"
          : "Confidence reduced"),
    };
  }
  if (row.status === "DEGRADED") {
    return {
      freshness: "Medium",
      completeness: "Partial",
      conflict: "Feed intermittent",
      decisionImpact: row.impact ?? "Channel metrics provisional",
    };
  }
  return {
    freshness: "High",
    completeness: "High",
    conflict: "None",
    decisionImpact: "None",
  };
}

export function dataHealthRowsForRole(
  role: RoleView,
  vertical: DemoVerticalFamily = "restaurant",
): DataHealthRow[] {
  return sourcesForDemo(role, vertical).map((row) => {
    const dims = dimensionsFor(row);
    return {
      ...row,
      ...dims,
      unhealthy: row.status === "STALE" || row.status === "DEGRADED",
      relatedDecisions: relatedFor(row),
    };
  });
}

export function dataHealthSummaryForRole(
  role: RoleView,
  vertical: DemoVerticalFamily = "restaurant",
): {
  tone: "ok" | "warn" | "bad";
  summary: string;
  unhealthyCount: number;
  staleCount: number;
  degradedCount: number;
} {
  const rows = dataHealthRowsForRole(role, vertical);
  const staleCount = rows.filter((r) => r.status === "STALE").length;
  const degradedCount = rows.filter((r) => r.status === "DEGRADED").length;
  const unhealthyCount = staleCount + degradedCount;
  const issue = sourceIssueSummary(rows);
  if (!issue) {
    return {
      tone: "ok",
      summary: "Healthy",
      unhealthyCount: 0,
      staleCount: 0,
      degradedCount: 0,
    };
  }
  return {
    tone: degradedCount > 0 && staleCount > 0 ? "bad" : "warn",
    summary: issue,
    unhealthyCount,
    staleCount,
    degradedCount,
  };
}

/** Full org inventory — used when role is portfolio. */
export function allDataHealthRows(): DataHealthRow[] {
  return ALL_SOURCES.map((row) => ({
    ...row,
    ...dimensionsFor(row),
    unhealthy: row.status === "STALE" || row.status === "DEGRADED",
    relatedDecisions: relatedFor(row),
  }));
}
