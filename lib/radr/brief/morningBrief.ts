/**
 * Morning Brief builder - evidence-linked operating summary.
 */

import type { Finding } from "@/lib/radr/domain";
import type { OperatingContext } from "@/lib/radr/ports/operatingContext";
import { getDemoOperatingContext } from "@/lib/radr/ports/demoOperatingContext";
import { findingsForScope } from "@/lib/radr/findings/engine";
import { valueAtRiskFromFindings } from "@/lib/radr/findings/fromPriorityFinding";
import { attentionNowFindings } from "@/lib/radr/valueSemantics";
import { computeForecast } from "@/lib/radr/forecast/service";
import { demoGreeting } from "@/lib/radr/demoClock";

export type BriefLink = {
  label: string;
  href: string;
  findingId?: string;
};

export type MorningBrief = {
  kind: "location" | "group";
  greeting: string;
  headline: string;
  attentionCount: number;
  atRiskValue: number;
  currency: string;
  primaryIssue: string | null;
  metrics: { label: string; value: string; href?: string }[];
  topActions: BriefLink[];
  findings: Finding[];
};

export function buildLocationMorningBrief(
  locationId: string,
  options?: { findings?: Finding[]; context?: OperatingContext | null },
): MorningBrief | null {
  const ctx = options?.context ?? getDemoOperatingContext(locationId);
  if (!ctx) return null;

  const findings =
    options?.findings ?? findingsForScope(locationId);
  const open = attentionNowFindings(findings);
  const atRisk = valueAtRiskFromFindings(open);
  const forecast = computeForecast(ctx);
  const primary = open[0] ?? null;

  return {
    kind: "location",
    greeting: demoGreeting(),
    headline:
      open.length === 0
        ? `${ctx.locationName} is on plan.`
        : `${ctx.locationName}: ${open.length} item${open.length === 1 ? "" : "s"} need attention.`,
    attentionCount: open.length,
    atRiskValue: atRisk,
    currency: ctx.currency,
    primaryIssue: primary
      ? `${primary.subtype}: ${primary.title}`
      : null,
    metrics: [
      {
        label: "Reservations",
        value: String(ctx.bookings.reservationCount),
        href: "/app/service",
      },
      {
        label: "Booked covers",
        value: String(ctx.bookings.bookedCovers),
        href: "/app/service",
      },
      {
        label: "Waitlist",
        value: `${ctx.waitlist.reduce((s, w) => s + w.partySize, 0)} guests · ${ctx.waitlist.length} parties`,
        href: "/app/service",
      },
      {
        label: "Forecast covers",
        value: String(forecast.forecastCovers),
        href: "/app/forecast",
      },
      {
        label: "Expected revenue",
        value: `${Math.round(forecast.forecastRevenue / 100) / 10}k`,
        href: "/app/forecast",
      },
    ],
    topActions: open.slice(0, 3).map((f) => ({
      label: f.recommendation.title,
      href: f.presentation?.primaryAction.href ?? "/app/findings",
      findingId: f.id,
    })),
    findings: open,
  };
}

export function buildGroupMorningBrief(input: {
  orgName: string;
  locationIds: string[];
  totalLocations: number;
}): MorningBrief {
  const briefs = input.locationIds
    .map((id) => buildLocationMorningBrief(id))
    .filter((b): b is MorningBrief => Boolean(b));

  const attentionLocations = briefs.filter((b) => b.attentionCount > 0);
  const atRisk = briefs.reduce((s, b) => s + b.atRiskValue, 0);
  const allFindings = briefs.flatMap((b) => b.findings);
  allFindings.sort((a, b) => b.priorityScore - a.priorityScore);

  return {
    kind: "group",
    greeting: demoGreeting(),
    headline:
      attentionLocations.length === 0
        ? `${input.orgName} is broadly on plan.`
        : `${attentionLocations.length} of ${input.totalLocations} locations need attention.`,
    attentionCount: allFindings.length,
    atRiskValue: atRisk,
    currency: "EUR",
    primaryIssue: allFindings[0]
      ? `${allFindings[0].locationName}: ${allFindings[0].title}`
      : null,
    metrics: [
      {
        label: "Locations needing attention",
        value: String(attentionLocations.length),
        href: "/app/locations",
      },
      {
        label: "Exposed / recoverable",
        value: String(Math.round(atRisk)),
        href: "/app/findings",
      },
    ],
    topActions: allFindings.slice(0, 6).map((f) => ({
      label: `${f.locationName}: ${f.recommendation.title}`,
      href: f.presentation?.secondaryHref ?? "/app/findings",
      findingId: f.id,
    })),
    findings: allFindings,
  };
}
