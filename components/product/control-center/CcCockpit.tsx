"use client";

/**
 * Control Center — graphite operating instrument (visual baseline).
 * Lens drives copy / band / emphasis; composition stays one-screen.
 */

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ContributionBridge, BridgeSegment } from "@/lib/radr/finance/contributionBridge";
import type { BusinessPulse } from "@/lib/radr/product/businessPulse";
import type {
  ControlCenterBrief,
  NeedsYouRow,
} from "@/lib/radr/product/controlCenterMetrics";
import type { ExecutiveBrief } from "@/lib/radr/product/executiveBrief";
import type { PilotLocationPulse } from "@/lib/radr/product/demoOperatingPulse";
import { OperatingPulseLandscape } from "./OperatingPulseLandscape";
import { LIVE_SCENARIO, liveDecisionWindowMinutes } from "@/lib/radr/demoClock";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { formatIntelMoney } from "@/lib/radr/intelligence/graph";
import type { ControlCenterExperience } from "@/lib/radr/product/experienceComposer";
import { prioritizeNeedsYouIds } from "@/lib/radr/product/experienceComposer";
import { controlCenterLensFor } from "@/lib/radr/product/controlCenterLens";
import { useProduct } from "@/lib/product/store";
import { NORTHSTAR_RESTAURANTS } from "@/lib/radr/demo/organizations";
import "./control-center-instrument.css";

type Props = {
  brief: ExecutiveBrief;
  ccBrief: ControlCenterBrief;
  bridge: ContributionBridge;
  pulse: BusinessPulse;
  needsYou: NeedsYouRow[];
  emptyNeedsYou: boolean;
  locations: PilotLocationPulse[];
  healthSummary: { healthy: number; degraded: number; stale: number };
  verifiedFormatted: string;
  needJudgment: number;
  experience?: ControlCenterExperience;
  onSelectDecision: (id: string) => void;
  onExploreMetric: (metricId: string) => void;
};

const LOC_META: Record<
  string,
  { covers: number; avgCheck: number; laborPct: number; status: string; state: "ok" | "watch" | "pressure" }
> = {
  loc_berlin_mitte: {
    covers: 412,
    avgCheck: 84,
    laborPct: 31.2,
    status: "High pressure",
    state: "pressure",
  },
  loc_berlin_kreuzberg: {
    covers: 286,
    avgCheck: 72,
    laborPct: 29.8,
    status: "Delivery mix high",
    state: "watch",
  },
  loc_hamburg_hafen: {
    covers: 198,
    avgCheck: 79,
    laborPct: 28.4,
    status: "On track",
    state: "ok",
  },
  loc_frankfurt_westend: {
    covers: 176,
    avgCheck: 88,
    laborPct: 30.1,
    status: "Watch COGS",
    state: "watch",
  },
  loc_munich_altstadt: {
    covers: 224,
    avgCheck: 91,
    laborPct: 32.4,
    status: "Labor heavy",
    state: "watch",
  },
  loc_koln_ehrenfeld: {
    covers: 168,
    avgCheck: 68,
    laborPct: 27.9,
    status: "On track",
    state: "ok",
  },
  loc_dusseldorf_medienhafen: {
    covers: 152,
    avgCheck: 96,
    laborPct: 28.8,
    status: "Premium mix",
    state: "ok",
  },
  loc_stuttgart_mitte: {
    covers: 140,
    avgCheck: 74,
    laborPct: 27.2,
    status: "Stable",
    state: "ok",
  },
};

function pct(actual: number, plan: number): number {
  if (!plan) return 0;
  return Math.round(((actual - plan) / plan) * 1000) / 10;
}

function greeting(): string {
  const h = Number(LIVE_SCENARIO.clockLabel.split(":")[0] ?? 19);
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function resolveBand(
  lensBand: ReturnType<typeof controlCenterLensFor>["band"],
  drivers: BridgeSegment[],
) {
  return lensBand.map((item) => {
    const match = item.bridgeHint
      ? drivers.find(
          (d) => item.bridgeHint!.test(d.label) || item.bridgeHint!.test(d.id),
        )
      : undefined;
    const amount = match?.amount;
    return {
      id: item.id,
      label: item.label,
      value:
        amount !== undefined ? formatIntelMoney(amount) : item.fallbackValue,
      vs: item.fallbackVs,
      tone: item.tone,
      drill: item.id,
    };
  });
}

export function CcCockpit({
  bridge,
  needsYou,
  emptyNeedsYou,
  locations,
  verifiedFormatted,
  needJudgment,
  experience,
  onSelectDecision,
  onExploreMetric,
}: Props) {
  const router = useRouter();
  const { roleView, locationScope } = useProduct();
  const windowMin = liveDecisionWindowMinutes();
  const lens = useMemo(
    () => controlCenterLensFor(roleView, "restaurant"),
    [roleView],
  );
  const isGroupScope =
    locationScope === "all" || locationScope.startsWith("region_");

  const rankedNeeds = useMemo(
    () =>
      experience
        ? prioritizeNeedsYouIds(needsYou, experience.decisionPriorityIds)
        : needsYou,
    [needsYou, experience],
  );

  const drivers = bridge.segments.filter(
    (s) => s.kind === "positive" || s.kind === "negative",
  );
  const band = resolveBand(lens.band, drivers);
  const net = bridge.varianceAmount;

  const peakNeed = needsYou.find((row) => row.id === DECISION_IDS.peak);
  const preferPeak =
    lens.railReviewEmphasis === "service" ||
    lens.railReviewEmphasis === "kitchen";
  const active = preferPeak
    ? peakNeed ?? rankedNeeds[0]
    : rankedNeeds[0] ?? peakNeed;
  const isPeak = active?.id === DECISION_IDS.peak;
  const activeVerb = isPeak
    ? "Wait 12 minutes"
    : active?.recommendation ?? active?.title ?? "Review decision";
  const activeWhy = isPeak
    ? "Dining room pressure is expected to normalize around 20:35. Holding new bookings for 12 minutes should improve table turns and contribution."
    : active?.contextLine ??
      "RADR prepared this Decision from live operating signals.";

  const reviewSource = emptyNeedsYou
    ? []
    : [
        ...(peakNeed && preferPeak ? [peakNeed] : []),
        ...rankedNeeds.filter(
          (row) => row.id !== (preferPeak ? DECISION_IDS.peak : ""),
        ),
      ].slice(0, 3);

  const reviewItems = reviewSource.map((row) => ({
    id: row.id,
    title:
      row.id === DECISION_IDS.peak
        ? "Labor pressure at Soho · New York"
        : row.id === DECISION_IDS.marginCoke
          ? "High delivery mix in Kreuzberg"
          : row.id === DECISION_IDS.casterSugar
            ? "Prep gap · caster sugar"
            : `${row.classLabel ?? row.title} · ${row.locationLabel}`,
    meta:
      row.id === DECISION_IDS.peak
        ? "+22% vs plan"
        : row.id === DECISION_IDS.marginCoke
          ? "34% vs 22% target"
          : row.id === DECISION_IDS.casterSugar
            ? "3 kg below house par"
            : `${row.economicFormatted}${row.deadlineLabel ? ` · ${row.deadlineLabel}` : ""}`,
    tone:
      row.id === DECISION_IDS.peak ? ("neg" as const) : ("watch" as const),
  }));

  const orgTotal = NORTHSTAR_RESTAURANTS.locations.length;
  const scopedLocations = useMemo(() => {
    if (isGroupScope) {
      const byId = new Map(locations.map((l) => [l.locationId, l]));
      return NORTHSTAR_RESTAURANTS.locations.map((orgLoc, i) => {
        const existing = byId.get(orgLoc.id);
        if (existing) return existing;
        const plan = 38_000 + (i % 5) * 4_200;
        return {
          locationId: orgLoc.id,
          label: orgLoc.displayName,
          revenueActual: Math.round(plan * 0.97),
          revenuePlan: plan,
          contributionActual: Math.round(plan * 0.26),
          contributionPlan: Math.round(plan * 0.28),
          activeExposure: i % 3 === 0 ? 420 : 0,
          needsYouCount: 0,
          verifiedValue: 0,
          dataHealth: "ok" as const,
        };
      });
    }
    return locations.filter(
      (l) =>
        l.locationId === locationScope ||
        (locationScope === "loc_ber" && l.locationId === "loc_berlin_mitte"),
    );
  }, [isGroupScope, locations, locationScope]);

  const tableRows = scopedLocations.map((loc, i) => {
    const meta =
      LOC_META[loc.locationId] ??
      ({
        covers: 160 + i * 24,
        avgCheck: 74 + (i % 3) * 4,
        laborPct: 28 + (i % 4) * 0.8,
        status: loc.activeExposure > 500 ? "Needs decision" : "On track",
        state:
          loc.activeExposure > 800
            ? ("pressure" as const)
            : loc.dataHealth === "warn"
              ? ("watch" as const)
              : ("ok" as const),
      } as const);
    return {
      loc,
      meta,
      revPct: pct(loc.revenueActual, loc.revenuePlan),
      contribPct: pct(loc.contributionActual, loc.contributionPlan),
    };
  });

  const vvBars = [42, 58, 51, 66, 48, 72, 61, 78, 55, 69, 74, 82];

  return (
    <div
      className="rp-cc-instrument"
      data-surface="daylight"
      data-page="control-center"
      data-lens={lens.role}
      data-scope={isGroupScope ? "group" : "location"}
      data-hero={lens.heroObject}
    >
      <div className="rp-cc-instrument-main">
        <p className="rp-cci-ctx">
          {greeting().toUpperCase()}
          <span className="rp-cci-ctx-live">
            <i /> LIVE {LIVE_SCENARIO.clockLabel}
          </span>
        </p>

        <header className="rp-cci-hero">
          <h2 className="rp-cci-statement">
            <span>{lens.heroPrimary}</span>
            <span data-tone="adverse">{lens.heroAdverse}</span>
          </h2>
          <div className="rp-cci-net">
            <strong>{formatIntelMoney(net)}</strong>
            <span>vs plan · contribution</span>
          </div>
        </header>

        <p className="rp-cci-why">{lens.why}</p>

        <ul className="rp-cci-band" aria-label={lens.question}>
          {band.map((b) => (
            <li key={b.id}>
              <button type="button" onClick={() => onExploreMetric(b.drill)}>
                <span className="rp-cci-band-k">{b.label}</span>
                <span className="rp-cci-band-v" data-tone={b.tone}>
                  {b.value}
                </span>
                <span className="rp-cci-band-d">{b.vs}</span>
              </button>
            </li>
          ))}
        </ul>

        <section className="rp-cci-pulse" aria-label="Operating pulse">
          <div className="rp-cci-pulse-head">
            <div>
              <h3>Operating pulse</h3>
              <p>{lens.pulseCaption}</p>
            </div>
            <div className="rp-cci-pulse-legend" aria-hidden="true">
              <span>
                <i data-series="covers" /> Covers
              </span>
              <span>
                <i data-series="revenue" /> Revenue
              </span>
              <span>
                <i data-series="contrib" /> Contribution
              </span>
            </div>
          </div>
          <OperatingPulseLandscape
            onMarkerClick={() => onSelectDecision(DECISION_IDS.peak)}
          />
        </section>

        <section className="rp-cci-table-wrap" aria-label={lens.tableTitle}>
          <div className="rp-cci-table-head">
            <h3>
              {lens.tableTitle}
              {isGroupScope ? (
                <em>
                  {" "}
                  · {scopedLocations.length} of {orgTotal}
                </em>
              ) : null}
            </h3>
            <Link href="/app/locations">View locations →</Link>
          </div>
          <table className="rp-cci-table">
            <thead>
              <tr>
                <th scope="col">Location</th>
                <th scope="col">Revenue</th>
                <th scope="col">vs plan</th>
                <th scope="col">Contribution</th>
                <th scope="col">vs plan</th>
                <th scope="col">Labor</th>
                <th scope="col">State</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(({ loc, meta, revPct, contribPct }) => (
                <tr
                  key={loc.locationId}
                  onClick={() =>
                    router.push(`/app/locations/${loc.locationId}`)
                  }
                >
                  <td>{loc.label}</td>
                  <td>{formatDecisionMoney(loc.revenueActual)}</td>
                  <td data-tone={revPct >= 0 ? "pos" : "neg"}>
                    {revPct >= 0 ? "+" : ""}
                    {revPct}%
                  </td>
                  <td>{formatDecisionMoney(loc.contributionActual)}</td>
                  <td data-tone={contribPct >= 0 ? "pos" : "neg"}>
                    {contribPct >= 0 ? "+" : ""}
                    {contribPct}%
                  </td>
                  <td>{meta.laborPct.toFixed(1)}%</td>
                  <td>
                    <span className="rp-cci-status" data-state={meta.state}>
                      <i />
                      {meta.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <aside className="rp-cc-instrument-rail" aria-label="Intelligence rail">
        <section className="rp-cci-rail-card" data-card="decision">
          <p className="rp-cci-rail-k">
            Active decision
            <span className="rp-cci-live">Live</span>
          </p>
          {active && !emptyNeedsYou ? (
            <>
              <h3 className="rp-cci-decision-verb">{activeVerb}</h3>
              <p className="rp-cci-decision-where">
                {isPeak ? "Main dining · " : ""}
                {active.locationLabel}
                {isPeak && windowMin > 0 ? ` · ${windowMin}m` : ""}
              </p>
              <p className="rp-cci-decision-why">{activeWhy}</p>
              <div className="rp-cci-decision-meta">
                <div>
                  <em>Expected impact</em>
                  <strong>+{active.economicFormatted.replace(/^\+/, "")}</strong>
                </div>
                <div>
                  <em>Confidence</em>
                  <strong>78%</strong>
                </div>
              </div>
              <div className="rp-cci-conf" aria-hidden="true">
                <div className="rp-cci-conf-bar">
                  <i style={{ width: "78%" }} />
                </div>
              </div>
              <button
                type="button"
                className="rp-cci-cta"
                onClick={() => onSelectDecision(active.id)}
              >
                Review decision →
              </button>
            </>
          ) : (
            <p className="rp-cci-decision-why">
              Nothing needs your judgment. RADR is watching.
            </p>
          )}
        </section>

        <section className="rp-cci-rail-card" data-card="review">
          <p className="rp-cci-rail-k">
            {Math.min(needJudgment, 3)} things to review
          </p>
          <ul className="rp-cci-review">
            {reviewItems.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => onSelectDecision(item.id)}>
                  <span
                    className="rp-cci-dot"
                    data-tone={item.tone === "watch" ? undefined : item.tone}
                  />
                  <span>
                    <strong>{item.title}</strong>
                    <span>{item.meta}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rp-cci-rail-card rp-cci-vv" data-card="verified">
          <p className="rp-cci-rail-k">Verified value</p>
          <strong>{verifiedFormatted}</strong>
          <p className="rp-cci-vv-label">
            Verified contribution MTD{" "}
            <span className="rp-cci-vv-delta">+18%</span>
          </p>
          <div className="rp-cci-vv-bars" aria-hidden="true">
            {vvBars.map((h, i) => (
              <i key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
          <ul className="rp-cci-vv-stats">
            <li>
              <em>Decisions</em>
              <strong>12</strong>
            </li>
            <li>
              <em>Positive</em>
              <strong>9</strong>
            </li>
            <li>
              <em>Avg impact</em>
              <strong>€2.6k</strong>
            </li>
          </ul>
          <Link href="/app/value" className="rp-cci-vv-link">
            View verified value →
          </Link>
        </section>
      </aside>
    </div>
  );
}
