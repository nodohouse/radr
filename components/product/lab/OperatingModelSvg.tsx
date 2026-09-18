"use client";

/**
 * Control Center V3 — connected operating model.
 * Floor · arrivals · kitchen · delivery · turns · time.
 * Objects are the control surface.
 */

import type { LabDerived, LabFuture, LabNode, LabState } from "./labState";
import { LAB_TIMES } from "./labState";

type Props = {
  state: LabState;
  derived: LabDerived;
  onSelectNode: (n: LabNode) => void;
  onSelectFuture: (f: LabFuture) => void;
};

type TableSpec = {
  id: string;
  x: number;
  y: number;
  zone: "main" | "bar" | "terrace";
  state: "occ" | "open" | "reserved" | "turn";
};

/** Abstract Berlin Mitte floor — not CAD, not OpenTable. */
const TABLES: TableSpec[] = [
  // Main dining
  { id: "m1", x: 14, y: 22, zone: "main", state: "occ" },
  { id: "m2", x: 20, y: 20, zone: "main", state: "occ" },
  { id: "m3", x: 26, y: 22, zone: "main", state: "reserved" },
  { id: "m4", x: 14, y: 28, zone: "main", state: "occ" },
  { id: "m5", x: 20, y: 27, zone: "main", state: "open" },
  { id: "m6", x: 26, y: 28, zone: "main", state: "reserved" },
  { id: "m7", x: 17, y: 33, zone: "main", state: "turn" },
  { id: "m8", x: 23, y: 34, zone: "main", state: "turn" },
  { id: "m9", x: 29, y: 32, zone: "main", state: "open" },
  // Bar
  { id: "b1", x: 36, y: 18, zone: "bar", state: "occ" },
  { id: "b2", x: 40, y: 20, zone: "bar", state: "occ" },
  { id: "b3", x: 38, y: 25, zone: "bar", state: "open" },
  { id: "b4", x: 42, y: 26, zone: "bar", state: "turn" },
  // Terrace
  { id: "t1", x: 14, y: 40, zone: "terrace", state: "reserved" },
  { id: "t2", x: 20, y: 41, zone: "terrace", state: "open" },
  { id: "t3", x: 26, y: 40, zone: "terrace", state: "reserved" },
  { id: "t4", x: 32, y: 41, zone: "terrace", state: "turn" },
];

/** Arrival density by time index — covers landing */
const ARRIVALS = [4, 8, 14, 8, 4]; // sum ≈ 38

export function OperatingModelSvg({
  state,
  derived,
  onSelectNode,
  onSelectFuture,
}: Props) {
  const mode = state.mode;
  const future = state.selectedFuture;
  const why = state.whyStep;
  const vip = state.operatorContext === "vip";

  const kitPct = derived.kitchenPct;
  const kitH = Math.min(36, (kitPct / 100) * 36);
  const kitY = 48 - kitH;
  const seatKitH = Math.min(36, 0.97 * 36);

  const dim = (id: LabNode) =>
    state.selectedNode && state.selectedNode !== id ? "true" : undefined;
  const on = (id: LabNode) =>
    state.selectedNode === id ? "true" : undefined;

  const turnGlow =
    mode === "futures" && future === "seat_now"
      ? "hot"
      : mode === "futures" && future === "wait_12"
        ? "cool"
        : state.selectedNode === "turns"
          ? "hot"
          : "idle";

  const traj: Record<LabFuture, number[]> = {
    seat_now: [28, 40, 54, 64, 70],
    wait_12: vip ? [28, 32, 36, 40, 38] : [28, 30, 34, 36, 34],
    hard_stop: [28, 26, 24, 22, 22],
  };

  const poly = (ys: number[]) =>
    LAB_TIMES.map((_, i) => {
      const x = 52 + (i / (LAB_TIMES.length - 1)) * 44;
      return `${x},${8 + ys[i]! * 0.55}`;
    }).join(" ");

  const whyOn = (step: number) =>
    mode !== "why" || why >= step ? "true" : undefined;

  const tableClass = (t: TableSpec) => {
    if (mode === "futures" && future === "seat_now" && t.state === "open")
      return "lab-t lab-t-occ";
    if (t.state === "turn") return `lab-t lab-t-turn lab-t-turn-${turnGlow}`;
    if (t.state === "reserved") return "lab-t lab-t-reserved";
    if (t.state === "open") return "lab-t lab-t-open";
    return "lab-t lab-t-occ";
  };

  const approved = mode === "approved";

  return (
    <svg
      className="lab-model"
      viewBox="0 0 120 72"
      role="img"
      aria-label="Berlin Mitte operating model"
      data-mode={mode}
      data-future={future}
    >
      <defs>
        <linearGradient id="v3Kit" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="rgba(160, 90, 40, 0.45)" />
          <stop offset="55%" stopColor="rgba(200, 110, 45, 0.65)" />
          <stop offset="100%" stopColor="rgba(220, 70, 55, 0.85)" />
        </linearGradient>
        <linearGradient id="v3Wave" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(247,250,248,0.55)" />
          <stop offset="100%" stopColor="rgba(247,250,248,0.05)" />
        </linearGradient>
        <linearGradient id="v3Del" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(232,184,109,0)" />
          <stop offset="100%" stopColor="rgba(232,184,109,0.55)" />
        </linearGradient>
      </defs>

      {/* Precision time grid — sparse */}
      <g className="lab-v3-grid" aria-hidden="true">
        {LAB_TIMES.map((_, i) => {
          const x = 52 + (i / (LAB_TIMES.length - 1)) * 44;
          return (
            <line key={i} x1={x} y1="8" x2={x} y2="58" className="lab-v3-gridline" />
          );
        })}
        <line x1="8" y1="58" x2="112" y2="58" className="lab-v3-baseline" />
      </g>

      {/* —— FLOOR MAP —— */}
      <g
        className="lab-v3-floor"
        data-dim={dim("floor")}
        data-on={on("floor")}
        data-why={whyOn(1)}
        onClick={() => onSelectNode("floor")}
        role="button"
        tabIndex={0}
      >
        <rect x="8" y="10" width="38" height="40" rx="0.6" className="lab-v3-zone" />
        <text x="10" y="14.5" className="lab-v3-kicker">
          MAIN
        </text>
        <text x="36" y="14.5" className="lab-v3-kicker" textAnchor="end">
          BAR
        </text>
        <line x1="33" y1="16" x2="33" y2="36" className="lab-v3-zone-div" />
        <line x1="10" y1="37" x2="44" y2="37" className="lab-v3-zone-div" />
        <text x="10" y="40.5" className="lab-v3-kicker">
          TERRACE
        </text>

        {TABLES.map((t) => (
          <g key={t.id}>
            <circle
              cx={t.x}
              cy={t.y}
              r={t.state === "turn" ? 1.45 : 1.25}
              className={tableClass(t)}
            />
            {approved && (t.state === "open" || t.state === "turn") ? (
              <text
                x={t.x}
                y={t.y - 2.2}
                textAnchor="middle"
                className="lab-v3-action-tag"
              >
                HOLD
              </text>
            ) : null}
          </g>
        ))}

        <text x="10" y="47.5" className="lab-v3-metric">
          {derived.floorPct}%
        </text>
        <text x="22" y="47.5" className="lab-v3-meta">
          occupied
        </text>
      </g>

      {/* Legend micro */}
      <g className="lab-v3-legend" aria-hidden="true">
        <circle cx="10" cy="53" r="0.9" className="lab-t lab-t-occ" />
        <text x="12.5" y="54" className="lab-v3-legend-t">
          seated
        </text>
        <circle cx="22" cy="53" r="0.9" className="lab-t lab-t-open" />
        <text x="24.5" y="54" className="lab-v3-legend-t">
          open ≠ free
        </text>
        <circle cx="36" cy="53" r="0.9" className="lab-t lab-t-reserved" />
        <text x="38.5" y="54" className="lab-v3-legend-t">
          inbound
        </text>
      </g>

      {/* —— KITCHEN CAPACITY BAND —— */}
      <g
        className="lab-v3-kitchen"
        data-dim={dim("kitchen")}
        data-on={on("kitchen")}
        data-why={whyOn(2)}
        onClick={() => onSelectNode("kitchen")}
        role="button"
        tabIndex={0}
      >
        <rect x="50" y="10" width="14" height="40" rx="0.5" className="lab-v3-zone" />
        <text x="52" y="14.5" className="lab-v3-kicker">
          KITCHEN
        </text>
        {/* 90% threshold */}
        <line x1="51" y1="15.6" x2="63" y2="15.6" className="lab-v3-threshold" />
        <text x="63.5" y="16.2" className="lab-v3-threshold-label">
          90
        </text>
        {/* Seat-now ghost */}
        {(mode === "futures" || state.selectedNode === "kitchen") && (
          <rect
            x="52.5"
            y={48 - seatKitH}
            width="9"
            height={seatKitH}
            className="lab-v3-kit-ghost"
          />
        )}
        <rect
          x="52.5"
          y={kitY}
          width="9"
          height={kitH}
          fill="url(#v3Kit)"
          className="lab-v3-kit-fill"
        />
        <text x="57" y="46" textAnchor="middle" className="lab-v3-metric">
          {kitPct}%
        </text>
      </g>

      {/* Feed lines into kitchen — dine-in / walk-in / delivery */}
      <g className="lab-v3-feeds" data-why={whyOn(2)}>
        <path
          d="M46 28 C48 28, 49 30, 50 32"
          className="lab-v3-feed"
          data-kind="dine"
        />
        <path
          d="M46 34 C48 34, 49 34, 50 34"
          className="lab-v3-feed"
          data-kind="walk"
          data-dim={dim("walkins")}
          data-on={on("walkins")}
          onClick={() => onSelectNode("walkins")}
        />
        <path
          d="M68 22 C66 26, 66 30, 64 34"
          className="lab-v3-feed"
          data-kind="delivery"
          data-dim={dim("delivery")}
          data-on={on("delivery")}
          onClick={() => onSelectNode("delivery")}
        />
      </g>

      {/* —— DELIVERY STREAM —— */}
      <g
        className="lab-v3-delivery"
        data-dim={dim("delivery")}
        data-on={on("delivery")}
        data-why={whyOn(2)}
        onClick={() => onSelectNode("delivery")}
        role="button"
        tabIndex={0}
      >
        <rect x="68" y="10" width="18" height="16" rx="0.5" className="lab-v3-zone" />
        <text x="70" y="14.5" className="lab-v3-kicker">
          DELIVERY
        </text>
        <rect x="70" y="17" width="14" height="3.2" fill="url(#v3Del)" rx="0.3" />
        <text x="70" y="24" className="lab-v3-metric-sm">
          +{derived.deliveryPct}%
        </text>
        {approved ? (
          <text x="78" y="24" className="lab-v3-action-tag">
            THROTTLE
          </text>
        ) : null}
      </g>

      {/* —— ARRIVAL DENSITY —— */}
      <g
        className="lab-v3-arrivals"
        data-dim={dim("inbound")}
        data-on={on("inbound")}
        data-why={whyOn(1)}
        onClick={() => onSelectNode("inbound")}
        role="button"
        tabIndex={0}
      >
        <text x="68" y="32" className="lab-v3-kicker">
          INBOUND
        </text>
        <text x="86" y="32" className="lab-v3-metric-sm" textAnchor="end">
          {derived.inbound}
        </text>
        {ARRIVALS.map((n, i) => {
          const x = 68 + i * 4.2;
          const h = n * 1.15;
          return (
            <rect
              key={i}
              x={x}
              y={48 - h}
              width="3.2"
              height={h}
              rx="0.25"
              className="lab-v3-arrival-bar"
              data-peak={i === 2 ? "true" : undefined}
            />
          );
        })}
        <text x="68" y="51.5" className="lab-v3-meta">
          18:42 → 19:20
        </text>
      </g>

      {/* —— TURNS —— */}
      <g
        className="lab-v3-turns"
        data-dim={dim("turns")}
        data-on={on("turns")}
        data-why={whyOn(3)}
        onClick={() => onSelectNode("turns")}
        role="button"
        tabIndex={0}
      >
        <text x="90" y="14.5" className="lab-v3-kicker">
          TURNS
        </text>
        <text x="90" y="22" className="lab-v3-metric">
          {derived.turnRisk}
        </text>
        <text x="90" y="25.5" className="lab-v3-meta">
          exposed
        </text>
      </g>

      {/* —— WHY CONNECTORS —— */}
      {mode === "why" ? (
        <g className="lab-v3-why" data-step={why}>
          <path
            d="M46 30 L50 34"
            className="lab-v3-why-line"
            data-show={whyOn(2)}
          />
          <path
            d="M64 34 L68 40"
            className="lab-v3-why-line"
            data-show={whyOn(3)}
          />
          <path
            d="M64 40 L90 20"
            className="lab-v3-why-line"
            data-show={whyOn(3)}
          />
          <path
            d="M90 24 L100 40"
            className="lab-v3-why-line lab-v3-why-econ"
            data-show={whyOn(4)}
          />
          {why >= 1 ? (
            <g className="lab-v3-why-sources">
              <text x="68" y="56" className="lab-v3-why-src">
                RESERVATIONS
              </text>
              <text x="8" y="56" className="lab-v3-why-src">
                FLOOR
              </text>
              <text x="50" y="56" className="lab-v3-why-src">
                KDS
              </text>
            </g>
          ) : null}
          {why >= 4 ? (
            <text x="100" y="44" className="lab-v3-why-econ-label">
              €{derived.contribution}
            </text>
          ) : null}
        </g>
      ) : null}

      {/* —— FUTURES TRAJECTORIES —— */}
      {mode === "futures" ? (
        <g className="lab-v3-futures">
          {(Object.keys(traj) as LabFuture[]).map((f) => (
            <polyline
              key={f}
              points={poly(traj[f]!)}
              className="lab-v3-traj"
              data-active={future === f ? "true" : undefined}
              data-rec={
                f === derived.recommended ? "true" : undefined
              }
              onClick={() => onSelectFuture(f)}
            />
          ))}
          {LAB_TIMES.map((t, i) => {
            const x = 52 + (i / (LAB_TIMES.length - 1)) * 44;
            const y = 8 + traj[future]![i]! * 0.55;
            return (
              <circle
                key={t}
                cx={x}
                cy={y}
                r="1.1"
                className="lab-v3-traj-pt"
                data-now={i === 0 ? "true" : undefined}
              />
            );
          })}
        </g>
      ) : null}

      {/* —— CONTEXT NODE —— */}
      {vip ? (
        <g className="lab-v3-context-node">
          <rect x="90" y="40" width="22" height="10" rx="0.4" className="lab-v3-zone" />
          <text x="91.5" y="44" className="lab-v3-kicker">
            CONTEXT
          </text>
          <text x="91.5" y="48" className="lab-v3-meta">
            VIP · 18:50
          </text>
        </g>
      ) : null}

      {/* Time axis */}
      <g className="lab-v3-time">
        <text x="8" y="63" className="lab-v3-now">
          NOW
        </text>
        {LAB_TIMES.map((t, i) => {
          const x = 52 + (i / (LAB_TIMES.length - 1)) * 44;
          return (
            <text
              key={t}
              x={x}
              y="63"
              textAnchor="middle"
              className="lab-v3-tick"
              data-now={i === 0 ? "true" : undefined}
            >
              {t}
            </text>
          );
        })}
        <text x="112" y="63" textAnchor="end" className="lab-v3-meta">
          TIME →
        </text>
      </g>

      {/* Menu feature tag when approved */}
      {approved ? (
        <text x="50" y="68" className="lab-v3-action-tag">
          MENU · FEATURE HIGH €/MIN
        </text>
      ) : null}
    </svg>
  );
}
