"use client";

/**
 * Service Map — physical capacity under Decisions.
 * Empty table ≠ free system capacity. D-1911 is the proof case.
 */

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  berlinServiceSnapshots,
  type ServiceMapMode,
  type ServiceMapUnit,
} from "@/data/demo/serviceMap";
import {
  getConnectedScenario,
  setPeakPath,
  setServiceTime,
  setServiceView,
  subscribeConnected,
} from "@/lib/radr/product/connectedState";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";
import { D1911_ECONOMICS } from "@/lib/radr/decision/economics/validator";
import { CANON_PEAK } from "@/lib/radr/decision/demo/canonical";
import {
  getBerlinServiceUniverse,
  type BerlinServiceUniverse,
} from "@/lib/radr/service/universe";
import { toServiceTableState } from "@/lib/radr/service/tableStates";
import { FloorOptimizerPanel } from "./FloorOptimizerPanel";
import {
  ServicePressureGrid,
  type PressureGridRow,
} from "./ServicePressureGrid";

const HORIZONS = [
  { id: "NOW", label: "NOW" },
  { id: "+30", label: "+30" },
  { id: "+60", label: "+60" },
  { id: "+120", label: "+120" },
] as const;

type ServiceHorizon = (typeof HORIZONS)[number]["id"];

const TIMES = [
  { id: "18:00", label: "18:00" },
  { id: "19:00", label: "19:00" },
  { id: "19:48", label: "19:48" },
  { id: "20:00", label: "20:00" },
  { id: "21:00", label: "21:00" },
] as const;

const REPLAY_STEPS = [
  { id: "18:00", label: "18:00 · Building", beat: "Covers building · kitchen warming" },
  { id: "19:00", label: "19:00 · Peak form", beat: "Inbound wave · hold decisions" },
  { id: "19:48", label: "19:48 · Decision", beat: "D-1911 · wait vs seat" },
  { id: "20:00", label: "20:00 · Pressure", beat: "Cold station peak · recovery starts" },
  { id: "21:00", label: "21:00 · Close", beat: "Pressure down · turns complete" },
] as const;

const MODES: { id: ServiceMapMode; label: string }[] = [
  { id: "occupancy", label: "Occupancy" },
  { id: "revenue", label: "Revenue" },
  { id: "pressure", label: "Pressure" },
  { id: "turns", label: "Turns" },
];

type PressureNode = {
  id: string;
  label: string;
  /** Observed / current pressure at selected clock. */
  currentPct: number;
  /** Modeled pressure if seat-now path continues. */
  projectedPct: number;
  linksDecision?: boolean;
};

const STATE_LABEL: Record<string, string> = {
  available: "AVAILABLE",
  occupied: "OCCUPIED",
  held: "HELD",
  inbound: "RESERVED",
  turn_risk: "TURNING",
  cancelled: "BLOCKED",
  dirty: "TURNING",
  ready: "AVAILABLE",
  ooo: "BLOCKED",
};

function useConnected() {
  return useSyncExternalStore(
    subscribeConnected,
    getConnectedScenario,
    getConnectedScenario,
  );
}

function tone(u: ServiceMapUnit, mode: ServiceMapMode, path: string) {
  if (mode === "revenue") {
    const c = u.contributionEuro ?? 0;
    if (c >= 80) return "ok";
    if (c >= 40) return "watch";
    if (u.state === "available" || u.state === "held") return "open";
    return "muted";
  }
  if (mode === "turns") {
    if (u.state === "turn_risk" || (u.turnMinutes ?? 0) >= 95) return "risk";
    if (u.state === "held" || u.state === "inbound") return "watch";
    if (u.state === "available") return "open";
    return "occ";
  }
  if (mode === "occupancy") {
    if (u.state === "available") return "open";
    if (u.state === "held" || u.state === "inbound") return "watch";
    if (u.state === "cancelled" || u.state === "ooo") return "muted";
    if (u.state === "turn_risk") return "risk";
    return "occ";
  }
  // pressure — use CURRENT (path=wait) for tone; seat path elevates risk
  const p = u.pressure ?? 0;
  if (path === "seat" && p >= 55) return p >= 75 ? "risk" : "watch";
  if (p >= 80) return "risk";
  if (p >= 55) return "watch";
  if (u.state === "available") return "open";
  return "ok";
}

function pressureFor(time: string, path: string): PressureNode[] {
  const seat = path === "seat";
  const node = (
    id: string,
    label: string,
    current: number,
    projectedBump: number,
    linksDecision?: boolean,
  ): PressureNode => ({
    id,
    label,
    currentPct: current,
    projectedPct: Math.min(100, current + (seat ? projectedBump : Math.max(0, projectedBump - 8))),
    linksDecision,
  });
  if (time === "18:00") {
    return [
      node("dining", "Dining room", 54, 8),
      node("bar", "Bar", 48, 6),
      node("cold", "Cold station", 61, 10),
      node("hot", "Hot station", 58, 8),
      node("delivery", "Delivery", 44, 12),
    ];
  }
  if (time === "21:00") {
    return [
      node("dining", "Dining room", 48, 4),
      node("bar", "Bar", 52, 4),
      node("cold", "Cold station", 41, 6),
      node("hot", "Hot station", 38, 5),
      node("delivery", "Delivery", 29, 4),
    ];
  }
  if (time === "20:00") {
    return [
      node("dining", "Dining room", 74, 12),
      node("bar", "Bar", 68, 10),
      node("cold", "Cold station", 82, 15, true),
      node("hot", "Hot station", 76, 12),
      node("delivery", "Delivery", 71, 14),
    ];
  }
  // NOW / 19:00 peak window — CURRENT under wait; PROJECTED under seat
  return [
    node("dining", "Dining room", 74, 12),
    node("bar", "Bar", 68, 10),
    node("cold", "Cold station", path === "wait" ? 88 : 97, 9, true),
    node("hot", "Hot station", 82, 12),
    node("delivery", "Delivery", 91, 8),
  ];
}

/** Short station names for grid row headers. */
const PRESSURE_SHORT: Record<string, string> = {
  dining: "Dining",
  bar: "Bar",
  cold: "Cold",
  hot: "Hot",
  delivery: "Delivery",
};

/** Station id → FloorOptimizationPlan pressure key. */
const PLAN_KEY: Record<string, string> = {
  dining: "Dining",
  bar: "Bar",
  cold: "Cold",
  hot: "Hot",
  delivery: "Delivery",
};

const GUEST_IMPACT_LABEL = {
  none: "None",
  low: "Low",
  medium: "Medium",
  high: "High",
} as const;

/** Semantic option model — every fact is its own node, never concatenated. */
const TABLE6_FUTURES = D1911_ECONOMICS.options.map((o) => {
  const inc = o.economics.incrementalVsBaseline ?? 0;
  const path =
    o.id === "wait_12" ? ("wait" as const) : o.id === "seat_now" ? ("seat" as const) : null;
  const title =
    o.id === "wait_12"
      ? "Wait 12 min"
      : o.id === "seat_now"
        ? "Seat now"
        : "Throttle delivery";
  const guest =
    CANON_PEAK.scenarios.find((s) => s.id === o.id)?.guestImpact ?? "low";
  const kitchen =
    o.id === "wait_12"
      ? "97% → 88%"
      : o.id === "seat_now"
        ? "→ 97%"
        : "Protected";
  return {
    id: o.id,
    title,
    delta: inc === 0 ? "€0" : `${inc > 0 ? "+" : "−"}€${Math.abs(inc).toLocaleString("en-IE")}`,
    deltaLabel: inc === 0 ? "baseline" : "vs seat-now",
    kitchen,
    guest: GUEST_IMPACT_LABEL[guest],
    recommended: Boolean(o.recommended),
    path,
  };
});

const ZONE_DENSITY: Record<string, string> = {
  MAIN: "Dense · peak collision",
  BAR: "Moderate · VIP hold",
  TERRACE: "Soft · weather risk",
};

type Props = {
  universe?: BerlinServiceUniverse;
  /** When true, omit page-level brand header — ServiceShell owns it. */
  embedded?: boolean;
};

export function ServiceMapInstrument({
  universe: universeProp,
  embedded = false,
}: Props = {}) {
  const connected = useConnected();
  const universe = universeProp ?? getBerlinServiceUniverse();
  const protectedIds = useMemo(
    () => new Set(universe.protectedTableIds),
    [universe.protectedTableIds],
  );
  const path = connected.peakPath === "seat" ? "seat" : "wait";
  const timeIds = TIMES.map((t) => t.id);
  const time = (
    timeIds.includes(connected.serviceTime as (typeof TIMES)[number]["id"])
      ? connected.serviceTime
      : "19:48"
  ) as (typeof TIMES)[number]["id"];
  const [mode, setMode] = useState<ServiceMapMode>("pressure");
  const [inspectId, setInspectId] = useState<string | null>("t6");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [replay, setReplay] = useState(false);
  const [replayIdx, setReplayIdx] = useState(2);
  const [compareOpen, setCompareOpen] = useState(false);
  const [horizon, setHorizon] = useState<ServiceHorizon>("NOW");

  const snap = useMemo(() => {
    const shots = berlinServiceSnapshots();
    if (time === "19:00" && path === "seat") return shots["19:00_seat"]!;
    return shots[time] ?? shots["19:48"]!;
  }, [time, path]);

  const inspected = snap.units.find((u) => u.id === inspectId);
  const isPeakTable = inspectId === "t6";
  const pressures = pressureFor(time, path);
  const plan = universe.floorPlan;
  const inboundRows = useMemo(
    () => [
      {
        when: "NOW",
        label: `${snap.occupancyPct}% on floor · waitlist ${universe.summary.waitingCount} · kitchen ${snap.kitchenLoadPct ?? "—"}%`,
        tone: (snap.kitchenLoadPct ?? 0) >= 85 ? ("watch" as const) : ("ok" as const),
      },
      {
        when: "+30",
        label: `${universe.arrivals.expectedCovers} inbound covers · delivery spike · kitchen dependency rises`,
        tone: "watch" as const,
      },
      {
        when: "+60",
        label: "Party of 8 · terrace hold · second-turn window narrowing",
        tone: "ok" as const,
      },
      {
        when: "+120",
        label: "Close ramp · covers easing · throttle delivery if still hot",
        tone: "ok" as const,
      },
    ],
    [snap, universe.arrivals.expectedCovers, universe.summary.waitingCount],
  );

  const pressureRows: PressureGridRow[] = pressures.map((p) => {
    const key = PLAN_KEY[p.id];
    return {
      id: p.id,
      label: PRESSURE_SHORT[p.id] ?? p.label,
      current: p.currentPct,
      seatNow: p.projectedPct,
      optimized:
        plan.improved && key != null ? (plan.pressureOptimized[key] ?? null) : null,
    };
  });

  const ghosts =
    time === "19:48"
      ? (berlinServiceSnapshots()["19:00"]?.units.filter(
          (u) => u.state === "inbound" || u.state === "held",
        ) ?? [])
      : [];

  const selectTable = (id: string) => {
    setInspectId(id);
    setDrawerOpen(true);
  };

  return (
    <div
      className="rp-smap"
      data-v2="floor"
      data-mode={mode}
      data-path={path}
      data-embedded={embedded ? "true" : undefined}
    >
      {!embedded ? (
        <header className="rp-smap-head">
          <div>
            <p className="rp-cin-kicker">Service</p>
            <h1 className="rp-cin-headline">Floor</h1>
            <p className="rp-cin-quiet">
              Covers · waitlist · kitchen dependency — empty seat ≠ free capacity
              · {displayDecisionId(DECISION_IDS.peak)}
            </p>
          </div>
          <p className="rp-smap-phase">
            <strong>{snap.at}</strong>
            <span>{snap.phase}</span>
          </p>
        </header>
      ) : (
        <p className="rp-smap-phase rp-smap-phase-embed">
          <strong>{snap.at}</strong>
          <span>{snap.phase}</span>
        </p>
      )}

      <FloorOptimizerPanel
        plan={universe.floorPlan}
        compareOpen={compareOpen}
        onCompare={() => setCompareOpen(true)}
        onCloseCompare={() => setCompareOpen(false)}
      />

      <div className="rp-smap-toolbar" role="toolbar" aria-label="Service controls">
        <div
          className="rp-smap-seg"
          data-primary="true"
          role="tablist"
          aria-label="Service horizon"
        >
          {HORIZONS.map((h) => (
            <button
              key={h.id}
              type="button"
              role="tab"
              aria-selected={horizon === h.id}
              data-active={horizon === h.id ? "true" : undefined}
              onClick={() => setHorizon(h.id)}
            >
              {h.label}
            </button>
          ))}
        </div>
        <div className="rp-smap-seg" role="tablist" aria-label="Clock">
          {TIMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={!replay && time === t.id}
              data-active={!replay && time === t.id ? "true" : undefined}
              onClick={() => {
                setReplay(false);
                setHorizon("NOW");
                setServiceTime(t.id);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="rp-smap-seg" role="tablist" aria-label="Mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              data-active={mode === m.id ? "true" : undefined}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="rp-smap-replay-toggle"
          data-active={replay ? "true" : undefined}
          onClick={() => {
            const next = !replay;
            setReplay(next);
            if (next) {
              const step = REPLAY_STEPS[replayIdx]!;
              setServiceTime(step.id);
            }
          }}
        >
          Replay service
        </button>
        <p className="rp-smap-toolbar-state" data-path={path}>
          <i aria-hidden="true" />
          {path === "wait" ? "Protected turns" : "Pressure elevated"}
        </p>
      </div>

      {replay ? (
        <div className="rp-smap-replay" aria-label="Service replay">
          <input
            type="range"
            min={0}
            max={REPLAY_STEPS.length - 1}
            value={replayIdx}
            aria-label="Replay scrubber"
            onChange={(e) => {
              const idx = Number(e.target.value);
              setReplayIdx(idx);
              const step = REPLAY_STEPS[idx]!;
              setServiceTime(step.id);
            }}
          />
          <p>
            <strong>{REPLAY_STEPS[replayIdx]!.label}</strong>
            <span>{REPLAY_STEPS[replayIdx]!.beat}</span>
          </p>
        </div>
      ) : null}

      {/* FLOOR + DRAWER */}
      <div className="rp-smap-layout" data-drawer={drawerOpen ? "open" : "closed"}>
        <div className="rp-smap-stage">
          <div className="rp-smap-meta">
            <span>
              <strong>{snap.occupancyPct}%</strong> occupied
            </span>
            {snap.kitchenLoadPct != null ? (
              <span data-tone={snap.kitchenLoadPct >= 90 ? "risk" : undefined}>
                <strong>{snap.kitchenLoadPct}%</strong> kitchen
              </span>
            ) : null}
            <span>
              <strong>{snap.inboundCovers ?? 0}</strong> inbound covers
            </span>
          </div>

          <svg
            className="rp-smap-svg"
            viewBox="0 0 100 72"
            role="img"
            aria-label="Berlin floor plan"
            data-path={path}
            data-time={time}
          >
            <rect
              className="rp-smap-zone"
              x="2"
              y="2"
              width="62"
              height="48"
              rx="0.5"
              data-zone="MAIN"
              aria-label={`MAIN DINING · ${ZONE_DENSITY.MAIN}`}
            />
            <text className="rp-smap-zone-t" x="4" y="5.2">
              MAIN
            </text>
            <rect
              className="rp-smap-zone"
              x="2"
              y="52"
              width="40"
              height="18"
              rx="0.5"
              data-zone="BAR"
              aria-label={`BAR · ${ZONE_DENSITY.BAR}`}
            />
            <text className="rp-smap-zone-t" x="4" y="56">
              BAR
            </text>
            <rect
              className="rp-smap-zone"
              x="66"
              y="2"
              width="32"
              height="68"
              rx="0.5"
              data-zone="TERRACE"
              aria-label={`TERRACE · ${ZONE_DENSITY.TERRACE}`}
            />
            <text className="rp-smap-zone-t" x="68" y="6">
              TERRACE
            </text>

            {time === "19:48" || time === "19:00" ? (
              <g className="rp-smap-wave" aria-hidden="true">
                <path
                  d="M8 68 Q30 58 50 62 T92 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.35"
                  strokeDasharray="1.2 1"
                />
              </g>
            ) : null}

            {ghosts.map((g) => (
              <rect
                key={`g-${g.id}`}
                className="rp-smap-ghost"
                x={g.x * 0.96}
                y={g.y * 0.68}
                width={Math.max(4, (g.w ?? 8) * 0.55)}
                height={Math.max(3.5, (g.h ?? 8) * 0.45)}
                rx="0.4"
              />
            ))}

            {snap.units.map((u) => {
              const t = tone(u, mode, path);
              const w = Math.max(4, (u.w ?? 8) * 0.55);
              const h = Math.max(3.5, (u.h ?? 8) * 0.45);
              const decisionMark = u.id === "t6";
              const isProtected = protectedIds.has(u.id);
              const canon = toServiceTableState(u.state, {
                protected: isProtected,
              });
              const stateShort = canon.slice(0, 4);
              return (
                <g
                  key={u.id}
                  className="rp-smap-table"
                  data-tone={t}
                  data-decision={decisionMark ? "true" : undefined}
                  data-protected={isProtected ? "true" : undefined}
                  data-on={inspectId === u.id ? "true" : undefined}
                  transform={`translate(${u.x * 0.96} ${u.y * 0.68})`}
                  onClick={() => selectTable(u.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Table ${u.label} · ${canon.replace(/_/g, " ")}`}
                  data-state={u.state}
                  data-canon={canon}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") selectTable(u.id);
                  }}
                >
                  <rect width={w} height={h} rx="0.4" />
                  <text
                    className="rp-smap-table-num"
                    x={w / 2}
                    y={h / 2 + 0.35}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {u.label}
                  </text>
                  <text
                    className="rp-smap-table-state"
                    x={w / 2}
                    y={h / 2 + 1.85}
                    textAnchor="middle"
                  >
                    {isProtected ? "LOCK" : stateShort}
                  </text>
                  <title>{`${u.label} · ${canon.replace(/_/g, " ")}`}</title>
                  {decisionMark ? (
                    <circle
                      className="rp-smap-dec-dot"
                      cx={w - 0.8}
                      cy={0.8}
                      r="0.9"
                    />
                  ) : null}
                </g>
              );
            })}
          </svg>

          <p className="rp-smap-legend rp-smap-zone-legend" aria-label="Zone density">
            <span>
              <strong>MAIN</strong> {ZONE_DENSITY.MAIN}
            </span>
            <span>
              <strong>BAR</strong> {ZONE_DENSITY.BAR}
            </span>
            <span>
              <strong>TERRACE</strong> {ZONE_DENSITY.TERRACE}
            </span>
          </p>
          <p className="rp-smap-legend rp-smap-key">
            Occupied · Reserved · Held · Turning · Available · Ghost next ·
            Green dot = {displayDecisionId(DECISION_IDS.peak)}
          </p>
        </div>

        {drawerOpen && inspected ? (
          <aside className="rp-smap-drawer" aria-label="Table detail">
            <header className="rp-smap-drawer-h">
              <div>
                <p className="rp-cin-kicker">Table {inspected.label}</p>
                <h2>{inspected.zone.replace("_", " ")}</h2>
                <p className="rp-smap-drawer-tags">
                  <span
                    className="rp-smap-drawer-state"
                    data-state={inspected.state}
                  >
                    {STATE_LABEL[inspected.state] ?? inspected.state}
                  </span>
                  {isPeakTable ? (
                    <span className="rp-smap-drawer-decision">
                      <em>Decision</em>
                      <strong>{displayDecisionId(DECISION_IDS.peak)}</strong>
                    </span>
                  ) : null}
                </p>
              </div>
              <button
                type="button"
                className="rp-smap-drawer-close"
                aria-label="Close detail"
                onClick={() => setDrawerOpen(false)}
              >
                ×
              </button>
            </header>

            <dl className="rp-smap-drawer-stats">
              <div>
                <dt>Seats</dt>
                <dd>{inspected.seats ?? "—"}</dd>
              </div>
              {isPeakTable ? (
                <div>
                  <dt>Inbound</dt>
                  <dd>
                    <span className="rp-smap-stat-main">38</span>
                    <span className="rp-smap-stat-sub">in 22m</span>
                  </dd>
                </div>
              ) : null}
              {isPeakTable ? (
                <div data-span="2">
                  <dt>Kitchen</dt>
                  <dd className="rp-smap-kitchen-pair">
                    <span>
                      <b>88%</b>
                      <i>now</i>
                    </span>
                    <span>
                      <b>97%</b>
                      <i>if seated</i>
                    </span>
                  </dd>
                </div>
              ) : null}
              {inspected.pressure != null ? (
                <div>
                  <dt>Pressure</dt>
                  <dd>{inspected.pressure}</dd>
                </div>
              ) : null}
              {inspected.contributionEuro != null ? (
                <div>
                  <dt>Contribution</dt>
                  <dd>{formatDecisionMoney(inspected.contributionEuro)}</dd>
                </div>
              ) : null}
              {inspected.turnMinutes != null ? (
                <div>
                  <dt>Turn</dt>
                  <dd>{inspected.turnMinutes}m</dd>
                </div>
              ) : null}
            </dl>
            {isPeakTable ? (
              <p className="rp-smap-related-dec">
                <span>Related Decision</span>
                <Link href={`/app/decisions/${DECISION_IDS.peak}`}>
                  {displayDecisionId(DECISION_IDS.peak)}
                </Link>
              </p>
            ) : null}

            {isPeakTable ? (
              <div className="rp-smap-why">
                <h3>Why RADR recommends waiting</h3>
                <ol className="rp-smap-causal">
                  <li>Inbound wave → kitchen pressure rises</li>
                  <li>→ second-turn risk on occupied tables</li>
                  <li>→ hold walk-in tables (Table 6) until pressure eases</li>
                </ol>

                <h3>Futures · incremental vs seat-now</h3>
                <ul className="rp-smap-futures">
                  {TABLE6_FUTURES.map((f) => (
                    <li
                      key={f.id}
                      data-rec={f.recommended ? "true" : undefined}
                      data-on={f.path && f.path === path ? "true" : undefined}
                    >
                      <button
                        type="button"
                        aria-pressed={f.path ? f.path === path : undefined}
                        onClick={() => {
                          if (f.path) setPeakPath(f.path);
                        }}
                      >
                        <span className="rp-smap-opt-head">
                          <span className="rp-smap-opt-title">{f.title}</span>
                          {f.recommended ? (
                            <span className="rp-smap-opt-badge">Recommended</span>
                          ) : null}
                        </span>
                        <span className="rp-smap-opt-econ">
                          <span className="rp-smap-opt-delta">{f.delta}</span>
                          <span className="rp-smap-opt-delta-lbl">{f.deltaLabel}</span>
                        </span>
                        <span className="rp-smap-opt-facts">
                          <span className="rp-smap-opt-fact">
                            <span className="rp-smap-opt-k">Kitchen</span>
                            <span className="rp-smap-opt-v">{f.kitchen}</span>
                          </span>
                          <span className="rp-smap-opt-fact">
                            <span className="rp-smap-opt-k">Guest impact</span>
                            <span className="rp-smap-opt-v">{f.guest}</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                <p className="rp-smap-actions">
                  <span>Prepared for approval · SERVICE CAPACITY policy</span>
                  <Link href={`/app/decisions/${DECISION_IDS.peak}`}>
                    Open {displayDecisionId(DECISION_IDS.peak)} →
                  </Link>
                </p>
                <div className="rp-smap-intel-links">
                  <button type="button" onClick={() => setServiceView("floor")}>
                    View floor plan
                  </button>
                  <button type="button" onClick={() => setServiceView("timeline")}>
                    View timeline
                  </button>
                  <button type="button" onClick={() => setServiceView("recovery")}>
                    View recoverable demand
                  </button>
                </div>
              </div>
            ) : (
              <div className="rp-smap-why">
                {protectedIds.has(inspected.id) ? (
                  <p className="rp-smap-protected">
                    PROTECTED — floor optimizer will not move this table unless
                    policy explicitly permits.
                  </p>
                ) : null}
                {inspected.id === "t14" ? (
                  <button
                    type="button"
                    className="rp-svc-cta"
                    onClick={() => setServiceView("recovery")}
                  >
                    Open cancellation recovery →
                  </button>
                ) : null}
                {inspected.note ? <p>{inspected.note}</p> : null}
                {inspected.party ? (
                  <p className="rp-cin-quiet">Party · {inspected.party}</p>
                ) : null}
                <p className="rp-smap-actions">
                  <span>Hold / release · prepared when material</span>
                </p>
              </div>
            )}
          </aside>
        ) : null}
      </div>

      {/* ONE PRESSURE RAIL — semantic grid + inbound (no duplicated station widgets) */}
      <section className="rp-smap-rail" aria-label="Pressure and inbound">
        <header className="rp-smap-rail-h">
          <h2>Service pressure</h2>
          <p>
            NOW · +30 · +60 · +120 — kitchen load vs inbound covers · current
            vs seat-now
          </p>
        </header>
        <ServicePressureGrid
          label="Station pressure · current vs seat-now"
          focusId="cold"
          rows={pressureRows}
        />
        <ul className="rp-smap-inbound" aria-label="Inbound demand">
          {inboundRows.map((row) => (
            <li
              key={row.when}
              data-tone={row.tone}
              data-active={horizon === row.when ? "true" : undefined}
            >
              <button
                type="button"
                className="rp-smap-inbound-hit"
                aria-pressed={horizon === row.when}
                onClick={() => setHorizon(row.when as ServiceHorizon)}
              >
                <em>{row.when}</em>
                <span>{row.label}</span>
              </button>
            </li>
          ))}
          {time === "19:48" || time === "19:00" ? (
            <li className="rp-smap-inbound-wave" data-tone="peak">
              <em>Wave</em>
              <span>Peak pressure inbound · 20:10–20:35</span>
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
