"use client";

/**
 * Cinema-pass Control Center composition pieces.
 * Direct attention — not identical cards.
 */

import Link from "next/link";
import { useState } from "react";
import type { ExecutiveBrief } from "@/lib/radr/product/executiveBrief";
import type { BusinessPulse, PulseMetric } from "@/lib/radr/product/businessPulse";
import type { ContributionBridge } from "@/lib/radr/finance/contributionBridge";
import type { PilotLocationPulse } from "@/lib/radr/product/demoOperatingPulse";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { useFocusRail } from "@/components/product/focus/FocusRail";
import { MetricDelta } from "@/components/product/ui/MetricDelta";

function formatCompactEuro(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1000) {
    const k = abs / 1000;
    const body = k % 1 === 0 ? `${k.toFixed(0)}` : `${k.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}`;
    return `€${body}k`;
  }
  return formatDecisionMoney(n);
}

function formatDriverDelta(n: number): string {
  const abs = Math.abs(n);
  const k = abs / 1000;
  const body =
    k >= 1
      ? k % 1 === 0
        ? k.toFixed(0)
        : k.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")
      : abs.toFixed(abs >= 100 ? 0 : 2);
  return `${n < 0 ? "−" : "+"}${k >= 1 ? body : formatDecisionMoney(abs).replace("€", "")}`;
}

function shortDriverLabel(label: string): string {
  const map: Record<string, string> = {
    "Sales volume": "Sales",
    "Menu mix": "Mix",
    Labor: "Labor",
    COGS: "COGS",
    "Channel fees": "Channels",
  };
  for (const [k, v] of Object.entries(map)) {
    if (label.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return label.split(" ")[0] ?? label;
}

export function ExecutiveBriefPanel({
  brief,
  proofLine,
}: {
  brief: ExecutiveBrief;
  /** Quiet system-proof line — sits with the brief, not a separate module. */
  proofLine?: string;
}) {
  return (
    <section className="rp-cin-exec rp-art-cover" aria-label="Executive brief">
      <p className="rp-cin-kicker">Since your last check</p>
      <h2 className="rp-cin-headline">{brief.headline}</h2>
      <div className="rp-cin-tension">
        <Link href="/app?view=performance" className="rp-cin-tension-a" data-tone="positive">
          <strong>{brief.revenueDeltaLabel}</strong>
          <span>Revenue vs forecast</span>
        </Link>
        <span className="rp-cin-tension-arrow" aria-hidden="true">
          ↘
        </span>
        <Link
          href="/app?view=performance"
          className="rp-cin-tension-b"
          data-tone="attention"
        >
          <strong>{brief.contributionDeltaLabel}</strong>
          <span>Contribution vs plan</span>
        </Link>
      </div>
      {brief.facts.length ? (
        <ul className="rp-cin-facts">
          {brief.facts.slice(0, 2).map((f) => (
            <li key={f.id} data-tone={f.tone}>
              {f.href ? <Link href={f.href}>{f.text}</Link> : <span>{f.text}</span>}
            </li>
          ))}
        </ul>
      ) : null}
      {proofLine ? <p className="rp-cin-proof">{proofLine}</p> : null}
    </section>
  );
}

function PulseRailItem({ m }: { m: PulseMetric }) {
  const delta = m.comparisonValue;
  const inner = (
    <>
      <em>{m.label}</em>
      <strong>{m.formatted}</strong>
      {m.comparisonFormatted && delta != null ? (
        <MetricDelta
          value={m.comparisonFormatted}
          deltaSigned={delta}
          higherIsBetter={m.higherIsBetter}
          size="meta"
        />
      ) : null}
    </>
  );
  return m.href ? (
    <Link href={m.href} className="rp-cin-rail-item" data-tier={m.tier}>
      {inner}
    </Link>
  ) : (
    <div className="rp-cin-rail-item" data-tier={m.tier}>
      {inner}
    </div>
  );
}

export function BusinessPulseStrip({
  pulse,
  compact = false,
}: {
  pulse: BusinessPulse;
  compact?: boolean;
}) {
  const metrics = compact
    ? pulse.primary.slice(0, 3)
    : [...pulse.primary, ...pulse.support];
  return (
    <section
      className="rp-cin-rail"
      data-compact={compact ? "true" : undefined}
      aria-label="Business pulse"
    >
      {!compact ? <p className="rp-cin-kicker">Business pulse</p> : null}
      <div className="rp-cin-rail-track">
        {metrics.map((m) => (
          <PulseRailItem key={m.id} m={m} />
        ))}
      </div>
    </section>
  );
}

const DRIVER_FOCUS: Record<
  string,
  { lines: string[]; decision?: string; href?: string }
> = {
  cogs: {
    lines: ["Tuna +11.6%", "Beef +8.2%", "Dairy +4.1%"],
    decision: "D-4102",
    href: "/app/decisions/dec_supplier_berlin",
  },
  labor: {
    lines: ["Actual vs scheduled +0.8pp", "Demand match open"],
    href: "/app/intelligence?cat=labor",
  },
  menu_mix: {
    lines: ["Contribution mix shift", "Peak dish economics"],
    href: "/app/intelligence?cat=menu",
  },
  channel_fees: {
    lines: ["Delivery mix fee pressure", "Commission vs contribution"],
    href: "/app/intelligence?cat=channels",
  },
  sales_volume: {
    lines: ["Covers ahead of plan", "Spend holding"],
    href: "/app/intelligence?cat=revenue",
  },
};

export function ContributionBridgeViz({
  bridge,
}: {
  bridge: ContributionBridge;
}) {
  const [focus, setFocus] = useState<string | null>(null);
  const focusRail = useFocusRail();
  const plan = bridge.segments.find((s) => s.id === "plan");
  const actual = bridge.segments.find((s) => s.id === "actual");
  const drivers = bridge.segments.filter(
    (s) => s.kind === "positive" || s.kind === "negative",
  );

  const W = 640;
  const H = 220;
  const padX = 24;
  const padY = 28;
  const barW = 48;
  const gap =
    (W - padX * 2 - barW * (drivers.length + 2)) / (drivers.length + 1);

  const running: number[] = [];
  let cursor = plan?.amount ?? 0;
  running.push(cursor);
  for (const d of drivers) {
    cursor += d.amount;
    running.push(cursor);
  }
  const allY = [plan?.amount ?? 0, ...running];
  const minY = Math.min(...allY) * 0.92;
  const maxY = Math.max(...allY) * 1.04;
  const scale = (v: number) =>
    H - padY - ((v - minY) / Math.max(maxY - minY, 1)) * (H - padY * 2);

  type Bar = {
    id: string;
    label: string;
    x: number;
    y: number;
    h: number;
    kind: string;
    formatted: string;
    amount: number;
  };
  const bars: Bar[] = [];

  bars.push({
    id: "plan",
    label: "Plan",
    x: padX,
    y: scale(plan?.amount ?? 0),
    h: H - padY - scale(plan?.amount ?? 0),
    kind: "base",
    formatted: formatCompactEuro(plan?.amount ?? 0),
    amount: plan?.amount ?? 0,
  });

  let level = plan?.amount ?? 0;
  drivers.forEach((d, i) => {
    const prev = level;
    level += d.amount;
    const yTop = scale(Math.max(prev, level));
    const yBot = scale(Math.min(prev, level));
    bars.push({
      id: d.id,
      label: shortDriverLabel(d.label),
      x: padX + (barW + gap) * (i + 1),
      y: yTop,
      h: Math.max(yBot - yTop, 2),
      kind: d.kind,
      formatted: formatDriverDelta(d.amount),
      amount: d.amount,
    });
  });

  bars.push({
    id: "actual",
    label: "Actual",
    x: padX + (barW + gap) * (drivers.length + 1),
    y: scale(actual?.amount ?? 0),
    h: H - padY - scale(actual?.amount ?? 0),
    kind: "result",
    formatted: formatCompactEuro(actual?.amount ?? 0),
    amount: actual?.amount ?? 0,
  });

  const focusMeta = focus ? DRIVER_FOCUS[focus] : null;
  const focusBar = focus ? bars.find((b) => b.id === focus) : null;

  return (
    <section
      className="rp-cin-bridge"
      data-waterfall="true"
      data-focus={focus ? "true" : undefined}
      aria-label="Contribution bridge"
    >
      <header className="rp-cin-bridge-head">
        <div>
          <p className="rp-cin-kicker">Why contribution moved</p>
          <p className="rp-cin-bridge-sub">{bridge.subtitle}</p>
        </div>
        <strong
          className="rp-cin-bridge-var"
          data-neg={bridge.varianceAmount < 0 ? "true" : undefined}
        >
          {bridge.varianceAmount < 0 ? "−" : "+"}
          {formatDecisionMoney(Math.abs(bridge.varianceAmount))}
        </strong>
      </header>

      <div className="rp-cin-bridge-body">
        <svg
          className="rp-cin-waterfall"
          viewBox={`0 0 ${W} ${H + 36}`}
          role="img"
          aria-label="Contribution waterfall from plan to actual"
        >
          {bars.map((b) => {
            const dim =
              focus &&
              focus !== b.id &&
              b.kind !== "base" &&
              b.kind !== "result";
            const hot = focus === b.id;
            const interactive = b.kind === "positive" || b.kind === "negative";
            return (
              <g
                key={b.id}
                className="rp-cin-wf-g"
                data-kind={b.kind}
                data-dim={dim ? "true" : undefined}
                data-hot={hot ? "true" : undefined}
                onMouseEnter={() =>
                  interactive ? setFocus(b.id) : undefined
                }
                onMouseLeave={() => setFocus(null)}
                onClick={() => {
                  if (!interactive) return;
                  setFocus((cur) => (cur === b.id ? null : b.id));
                  const meta = DRIVER_FOCUS[b.id];
                  if (meta) {
                    focusRail.openFocus({
                      id: b.id,
                      what: b.label,
                      why: meta.lines.join(" · "),
                      impact: `${b.formatted} vs plan`,
                      status:
                        b.kind === "negative"
                          ? "Pressure driver"
                          : "Positive driver",
                      relatedHref: meta.href,
                      relatedLabel: meta.decision
                        ? `${meta.decision} →`
                        : "Inspect →",
                      relatedDecisionId: meta.decision
                        ? "dec_supplier_berlin"
                        : null,
                    });
                  }
                }}
                style={{ cursor: interactive ? "pointer" : "default" }}
              >
                <rect
                  x={b.x}
                  y={b.y}
                  width={barW}
                  height={b.h}
                  rx={3}
                  className={`rp-cin-wf-bar rp-cin-wf-${b.kind}`}
                  data-kind={b.kind}
                />
                <text
                  x={b.x + barW / 2}
                  y={H + 14}
                  textAnchor="middle"
                  className="rp-cin-wf-label"
                >
                  {b.label}
                </text>
                <text
                  x={b.x + barW / 2}
                  y={b.y - 6}
                  textAnchor="middle"
                  className="rp-cin-wf-val"
                >
                  {b.formatted}
                </text>
              </g>
            );
          })}
        </svg>

        {focusBar && focusMeta ? (
          <aside className="rp-cin-driver-focus" aria-live="polite">
            <p className="rp-cin-kicker">{focusBar.label}</p>
            <strong>{focusBar.formatted} vs plan</strong>
            <ul>
              {focusMeta.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            {focusMeta.decision && focusMeta.href ? (
              <Link href={focusMeta.href}>
                {focusMeta.decision} →
              </Link>
            ) : focusMeta.href ? (
              <Link href={focusMeta.href}>Inspect →</Link>
            ) : null}
          </aside>
        ) : null}
      </div>
    </section>
  );
}

export function LocationPulseTable({
  locations,
}: {
  locations: PilotLocationPulse[];
}) {
  const maxAbsContrib = Math.max(
    ...locations.map((l) => Math.abs(l.contributionActual - l.contributionPlan)),
    1,
  );
  const maxExposure = Math.max(...locations.map((l) => l.activeExposure), 1);

  return (
    <section className="rp-ccx-locpulse" aria-label="Location pulse">
      <header className="rp-ccx-panel-head">
        <p className="rp-cin-kicker">Location pulse</p>
        <span>{locations.length} connected</span>
      </header>

      <div
        className="rp-cin-loc-matrix"
        role="img"
        aria-label="Performance versus exposure"
      >
        <p className="rp-cin-loc-matrix-axis" data-y>
          Exposure
        </p>
        <div className="rp-cin-loc-matrix-plot">
          {locations.map((loc) => {
            const contribDelta = loc.contributionActual - loc.contributionPlan;
            const x = 50 + (contribDelta / maxAbsContrib) * 38;
            const y = 88 - (loc.activeExposure / maxExposure) * 68;
            const size = 18 + Math.min(28, Math.sqrt(Math.abs(loc.revenueActual)) / 40);
            return (
              <Link
                key={loc.locationId}
                href={`/app/locations/${loc.locationId}`}
                className="rp-cin-loc-bubble"
                style={{
                  left: `${Math.max(8, Math.min(92, x))}%`,
                  top: `${Math.max(10, Math.min(88, y))}%`,
                  width: size,
                  height: size,
                }}
                title={`${loc.label}: contrib ${contribDelta >= 0 ? "+" : "−"}${formatDecisionMoney(Math.abs(contribDelta))}, exposure ${loc.activeExposure > 0 ? formatDecisionMoney(loc.activeExposure) : "none"}`}
              >
                <span>{loc.label.split("·")[0]?.trim().slice(0, 8)}</span>
              </Link>
            );
          })}
          <span className="rp-cin-loc-matrix-origin" aria-hidden="true" />
        </div>
        <p className="rp-cin-loc-matrix-axis" data-x>
          Contribution vs plan
        </p>
      </div>

      <div className="rp-ccx-locpulse-table" role="table">
        <div className="rp-ccx-locpulse-head" role="row">
          <span role="columnheader">Location</span>
          <span role="columnheader">Rev vs plan</span>
          <span role="columnheader">Contrib</span>
          <span role="columnheader">Exposure</span>
          <span role="columnheader">Needs you</span>
          <span role="columnheader">Verified</span>
        </div>
        {locations.map((loc) => {
          const revDelta = loc.revenueActual - loc.revenuePlan;
          const contribDelta = loc.contributionActual - loc.contributionPlan;
          return (
            <Link
              key={loc.locationId}
              href={`/app/locations/${loc.locationId}`}
              className="rp-ccx-locpulse-row"
              role="row"
              data-health={loc.dataHealth}
            >
              <strong role="cell">{loc.label}</strong>
              <span role="cell" data-pos={revDelta >= 0 ? "true" : undefined}>
                {revDelta >= 0 ? "+" : "−"}
                {formatDecisionMoney(Math.abs(revDelta))}
              </span>
              <span
                role="cell"
                data-pos={contribDelta >= 0 ? "true" : undefined}
              >
                {contribDelta >= 0 ? "+" : "−"}
                {formatDecisionMoney(Math.abs(contribDelta))}
              </span>
              <span role="cell">
                {loc.activeExposure > 0
                  ? formatDecisionMoney(loc.activeExposure)
                  : "—"}
              </span>
              <span role="cell">{loc.needsYouCount || "—"}</span>
              <span
                role="cell"
                data-verified={loc.verifiedValue > 0 ? "true" : undefined}
              >
                {loc.verifiedValue > 0
                  ? formatDecisionMoney(loc.verifiedValue)
                  : "—"}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
