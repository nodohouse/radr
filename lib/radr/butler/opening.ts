/**
 * Contextual Ask RADR opening state from domain SoT.
 */

import { getOperatingSnapshot } from "@/lib/radr/operatingSnapshot";
import { findingsForScope } from "@/lib/radr/findings";
import { currentExposureFromFindings } from "@/lib/radr/valueSemantics";
import { demoGreeting } from "@/lib/radr/demoClock";
import { BERLIN_TONIGHT_OPS } from "@/lib/radr/venueProfiles";
import { getCancellationRecoveryScenario } from "@/lib/radr/scenarios/store";
import { locationLabel, type DashPeriod, type LocationScope } from "@/lib/product/demo/dashboard";
import type { ButlerContext, ButlerOpening, ButlerOpeningSuggestion } from "./types";

const PERIOD_LABEL: Record<string, string> = {
  today: "Today",
  yesterday: "Yesterday",
  wtd: "Week to date",
  mtd: "Month to date",
  ytd: "Year to date",
};

function hourGreeting(): string {
  return `${demoGreeting()}.`;
}

function scopeName(scope: string): string {
  if (scope === "all") return "Northstar";
  if (scope.startsWith("region_")) return locationLabel(scope as LocationScope);
  return locationLabel(scope as LocationScope);
}

function contextLine(scope: string, periodLabel: string, entity?: string): string {
  const parts: string[] = [];
  if (scope === "all") {
    parts.push("Northstar", "All locations");
  } else if (scope.startsWith("region_")) {
    parts.push(locationLabel(scope as LocationScope));
  } else {
    parts.push(locationLabel(scope as LocationScope));
  }
  parts.push(periodLabel);
  if (entity) parts.push(entity);
  return parts.join(" · ").toUpperCase();
}

export function buildButlerOpening(ctx: ButlerContext): ButlerOpening {
  const scope = ctx.locationScope as LocationScope;
  const period = (ctx.period as DashPeriod) || "today";
  const snap = getOperatingSnapshot(scope, period);
  const engineFindings = findingsForScope(
    scope === "all" || String(scope).startsWith("region_") ? "loc_ber" : String(scope),
  );
  const atRisk = currentExposureFromFindings(engineFindings);
  const openCount = engineFindings.filter(
    (f) =>
      f.status !== "VERIFIED" &&
      f.status !== "RESOLVED" &&
      f.status !== "DISMISSED" &&
      currentExposureFromFindings([f]) > 0,
  ).length;
  const isGroup = scope === "all" || scope.startsWith("region_");
  const periodLabel = PERIOD_LABEL[period] ?? "Today";
  const actNow = engineFindings.filter((f) => f.urgency === "ACT_NOW").length;

  const greeting = hourGreeting();
  const headline =
    openCount === 0
      ? `${snap.locationName} is broadly on plan.`
      : isGroup
        ? `${openCount} open finding${openCount === 1 ? "" : "s"} across the group.`
        : `${snap.locationName} · ${openCount} item${openCount === 1 ? "" : "s"} need attention.`;

  const attentionLine =
    openCount > 0
      ? isGroup
        ? `${snap.attention.open} locations need attention · €${atRisk.toLocaleString("en-GB")} currently exposed`
        : `€${atRisk.toLocaleString("en-GB")} currently exposed`
      : null;

  const suggestions: ButlerOpeningSuggestion[] = [];

  if (openCount > 0) {
    suggestions.push({
      id: "attention",
      label: "What needs my attention?",
      query: "What needs my attention?",
    });
  }

  const labor = engineFindings.find((f) => f.territory === "LABOR");
  const buy = engineFindings.find((f) => f.territory === "BUY");

  if (scope === "loc_ber" || isGroup) {
    suggestions.push({
      id: "weather",
      label: "Will the weather affect us tomorrow?",
      query: "Will the weather affect us tomorrow?",
    });
  }

  if (isGroup || scope.startsWith("loc_nyc")) {
    suggestions.push({
      id: "nyc",
      label: "Compare New York locations",
      query: "Compare New York locations.",
    });
  } else if (labor) {
    suggestions.push({
      id: "labor",
      label: "Where are we understaffed?",
      query: "Where are we understaffed?",
    });
  }

  if (buy && suggestions.length < 3) {
    suggestions.push({
      id: "buy",
      label: "Where are we paying suppliers too much?",
      query: "Where are we paying suppliers too much?",
    });
  }

  if (openCount === 0) {
    suggestions.push(
      {
        id: "improve",
        label: "Where could we improve margin?",
        query: "Where could we improve margin?",
      },
      {
        id: "compare-week",
        label: "What changed since I last checked?",
        query: "What changed since I last checked?",
      },
      {
        id: "nyc",
        label: "Compare New York locations",
        query: "Compare New York locations.",
      },
    );
  }

  const seen = new Set<string>();
  const unique = suggestions
    .filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    })
    .slice(0, 3);

  let observation: ButlerOpening["observation"] = null;
  const scenario = getCancellationRecoveryScenario();
  if (
    (scope === "loc_ber" || scope === "all") &&
    BERLIN_TONIGHT_OPS.bookingPaceVsComparable >= 8
  ) {
    observation = {
      title: "RADR noticed",
      body: `Berlin Mitte booking pace +${BERLIN_TONIGHT_OPS.bookingPaceVsComparable}% vs comparable Wednesday.`,
      query: "Which location worries me most tonight?",
    };
  } else if (scenario.verification?.verifiedValue) {
    observation = {
      title: "RADR noticed",
      body: `Table 14 recovery verified €${scenario.verification.verifiedValue}.`,
      query: "Did we recover the Table 14 cancellation?",
    };
  }

  const contextChips: { id: string; label: string }[] = [
    { id: "scope", label: scopeName(scope) },
    { id: "period", label: periodLabel },
  ];
  if (ctx.selectedEntityLabel) {
    contextChips.push({ id: "entity", label: ctx.selectedEntityLabel });
  }

  const locationsNeeding =
    isGroup
      ? Math.max(snap.attention.open, openCount > 0 ? 1 : 0)
      : openCount > 0
        ? 1
        : 0;

  return {
    greeting,
    invite: "What do you want to know?",
    scopeLabel: scopeName(scope),
    periodLabel,
    contextLine: contextLine(scope, periodLabel, ctx.selectedEntityLabel),
    headline,
    attentionLine,
    exposureEuro: openCount > 0 ? atRisk : null,
    rightNow: {
      exposureLabel:
        atRisk > 0 ? `€${atRisk.toLocaleString("en-GB")} exposed` : null,
      attentionLabel:
        locationsNeeding > 0
          ? isGroup
            ? `${locationsNeeding} locations need attention`
            : `${openCount} item${openCount === 1 ? "" : "s"} need attention`
          : "On plan",
      actionsLabel:
        actNow > 0
          ? `${actNow} action${actNow === 1 ? "" : "s"} recommended`
          : null,
    },
    observation,
    suggestions: unique,
    contextChips,
  };
}
