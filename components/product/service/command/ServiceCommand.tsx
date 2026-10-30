"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useProduct } from "@/lib/product/store";
import {
  getServiceCommand,
  type DemandBar,
  type FloorTable,
  type PressureRow,
  type ServiceView,
  type TimeKey,
  type ZoneKey,
} from "@/lib/product/serviceCommand";
import "./service-command.css";

type Focus =
  | { kind: "kpi"; id: string }
  | { kind: "table"; id: string }
  | { kind: "pressure"; id: string }
  | { kind: "demand"; id: string }
  | null;

type Handling = "idle" | "handling" | "watching" | "verified";

const VIEWS: { id: ServiceView; label: string }[] = [
  { id: "floor", label: "Floor" },
  { id: "timeline", label: "Timeline" },
  { id: "kitchen", label: "Kitchen" },
  { id: "staff", label: "Staff" },
];

const TIMES: { id: TimeKey; label: string; kind: "now" | "offset" | "clock" }[] = [
  { id: "now", label: "Now", kind: "now" },
  { id: "+30", label: "+30", kind: "offset" },
  { id: "+60", label: "+60", kind: "offset" },
  { id: "+120", label: "+120", kind: "offset" },
  { id: "18:00", label: "18:00", kind: "clock" },
  { id: "19:00", label: "19:00", kind: "clock" },
  { id: "19:48", label: "19:48", kind: "clock" },
  { id: "20:00", label: "20:00", kind: "clock" },
  { id: "21:00", label: "21:00", kind: "clock" },
];

const ZONES: { id: ZoneKey; label: string }[] = [
  { id: "main", label: "Main (1–14)" },
  { id: "terrace", label: "Terrace (15–22)" },
  { id: "bar", label: "Bar (23–28)" },
  { id: "private", label: "Private (29–32)" },
];

const WAIT_TABLES = ["t2", "t4", "t8", "t9"];
const TURN_TABLES = ["t6", "t12"];
const KITCHEN_PRESSURE = ["hot", "delivery"];

function Spark({ values, tone }: { values: number[]; tone: string }) {
  const w = 44;
  const h = 14;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const color =
    tone === "neg" ? "#d4534a" : tone === "amber" ? "#c4882a" : "#00A85A";
  const bw = (w - 2) / values.length - 1;
  return (
    <svg className="sc-spark" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      {values.map((v, i) => {
        const bh = ((v - min) / span) * (h - 3) + 2;
        return (
          <rect
            key={i}
            x={1 + i * ((w - 2) / values.length)}
            y={h - bh}
            width={Math.max(bw, 1.8)}
            height={bh}
            rx="1"
            fill={color}
            opacity={0.45 + (i / values.length) * 0.55}
          />
        );
      })}
    </svg>
  );
}

function parseView(raw: string | null): ServiceView {
  if (raw === "timeline" || raw === "kitchen" || raw === "staff" || raw === "floor")
    return raw;
  return "floor";
}

function parseTime(raw: string | null): TimeKey {
  if (TIMES.some((t) => t.id === raw)) return raw as TimeKey;
  return "now";
}

function timeMeta(time: TimeKey): {
  mode: "live" | "forecast" | "observed";
  label: string;
  confidence?: number;
  shift: number;
} {
  if (time === "now" || time === "19:48")
    return { mode: "live", label: "LIVE", shift: 0 };
  if (time === "18:00" || time === "19:00")
    return { mode: "observed", label: "OBSERVED / REPLAY", shift: time === "18:00" ? -2 : -1 };
  if (time === "+30") return { mode: "forecast", label: "FORECAST", confidence: 86, shift: 1 };
  if (time === "+60" || time === "20:00")
    return { mode: "forecast", label: "FORECAST", confidence: 81, shift: 2 };
  if (time === "+120" || time === "21:00")
    return { mode: "forecast", label: "FORECAST", confidence: 74, shift: 3 };
  return { mode: "live", label: "LIVE", shift: 0 };
}

export function ServiceCommand() {
  const model = useMemo(() => getServiceCommand(), []);
  const { roleView } = useProduct();
  const isCfo = roleView === "cfo";
  const router = useRouter();
  const pathname = usePathname() || "/app/service";
  const search = useSearchParams();

  const [view, setView] = useState<ServiceView>(() => parseView(search.get("view")));
  const [time, setTime] = useState<TimeKey>(() => parseTime(search.get("time")));
  const [zone, setZone] = useState<ZoneKey>("main");
  const [tableId, setTableId] = useState(
    () => {
      const tbl = search.get("table");
      if (!tbl) return model.defaultTableId;
      return tbl.startsWith("t") ? tbl : `t${tbl}`;
    },
  );
  const [focus, setFocus] = useState<Focus>({ kind: "table", id: model.defaultTableId });
  const [kpiOpen, setKpiOpen] = useState<string | null>(null);
  const [insightOpen, setInsightOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [pressureOpen, setPressureOpen] = useState<string | null>(null);
  const [demandLocked, setDemandLocked] = useState<string | null>(null);
  const [demandTip, setDemandTip] = useState<DemandBar | null>(null);
  const [showFlow, setShowFlow] = useState(false);
  const [handling, setHandling] = useState<Handling>("idle");
  const [toast, setToast] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState("overview");
  const [hoverTable, setHoverTable] = useState<string | null>(null);

  const pushState = useCallback(
    (next: { view?: ServiceView; time?: TimeKey; table?: string | null }) => {
      const sp = new URLSearchParams(search.toString());
      if (next.view) sp.set("view", next.view);
      if (next.time) sp.set("time", next.time);
      if (next.table === null) sp.delete("table");
      else if (next.table) sp.set("table", next.table.replace(/^t/, ""));
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [pathname, router, search],
  );

  useEffect(() => {
    const v = parseView(search.get("view"));
    const t = parseTime(search.get("time"));
    const tbl = search.get("table");
    setView(v);
    setTime(t);
    if (tbl) {
      const id = tbl.startsWith("t") ? tbl : `t${tbl}`;
      if (model.tables.some((x) => x.id === id)) setTableId(id);
    }
  }, [search, model.tables]);

  const meta = timeMeta(time);
  const kitchenLoad = Math.min(99, Math.max(70, 92 + meta.shift * 2));
  const occupancy = Math.min(96, Math.max(62, 78 + meta.shift * 3));
  const walkIns = Math.max(12, 21 + meta.shift * 2);
  const recoverable =
    handling === "verified"
      ? "€0"
      : handling === "handling" || handling === "watching"
        ? "€414"
        : meta.shift >= 2
          ? "€620"
          : "€498";

  const tables = model.tables.filter((t) => t.zone === zone);
  const selectedTable = model.tables.find((t) => t.id === tableId);
  const detail = useMemo(() => {
    const known = model.tableDetails[tableId];
    if (known) return known;
    const t = selectedTable || model.tables.find((x) => x.id === model.defaultTableId)!;
    const wait = t.waitMin ?? 0;
    const isWait = t.tone === "wait";
    const isTurn = t.tone === "turning";
    return {
      tableId: t.id,
      title: `Table ${t.n}`,
      status: isWait ? "Needs attention" : isTurn ? "Turning soon" : t.statusLabel,
      statusTone: (isWait ? "wait" : isTurn ? "turning" : "seated") as "wait" | "turning" | "seated",
      meta: `${t.party ?? t.seats} guests${t.seatedMin != null ? ` · Seated ${t.seatedMin} min` : ""}`,
      problem: isWait
        ? `Table waiting ${wait} minutes for mains.`
        : isTurn
          ? "Ready to turn — frees capacity for inbound wave."
          : "No material exception on this table.",
      context: [
        `Kitchen load is ${kitchenLoad}%.`,
        isWait ? "Hot line is the bottleneck." : "Service within tolerance.",
      ],
      recommendation: isWait
        ? `Expedite mains for Table ${t.n}. Pre-bus a turning table to free pass capacity.`
        : isTurn
          ? `Pre-bus Table ${t.n} now ahead of the 20:10 wave.`
          : "Continue monitoring — no action required.",
      confidence: isWait || isTurn ? "High" : "Medium",
      outcomes: [
        { value: isWait ? `−${Math.min(16, wait - 5)} min` : "−8 min", label: "Expected wait / turn" },
        { value: isWait ? "+€48" : "+€96", label: "Contribution" },
        { value: "+8%", label: "Guest satisfaction" },
      ],
      doNothing: [
        { label: "Wait", value: isWait ? `${wait} → ${wait + 6} min` : "Slip +12 min" },
        { label: "Recovered", value: "€0" },
      ],
      withRadr: [
        { label: "Wait", value: isWait ? `${wait} → 5 min` : "On plan" },
        { label: "Recovered", value: isWait ? "+€48" : "+€96" },
      ],
    };
  }, [model, tableId, selectedTable, kitchenLoad]);

  const highlightTables = useMemo(() => {
    if (focus?.kind === "kpi" && focus.id === "kitchen") return WAIT_TABLES;
    if (focus?.kind === "pressure" && (focus.id === "hot" || focus.id === "delivery"))
      return WAIT_TABLES;
    if (focus?.kind === "demand") return [...WAIT_TABLES, ...TURN_TABLES];
    if (focus?.kind === "table") return [focus.id];
    if (focus?.kind === "kpi" && focus.id === "recoverable")
      return [...WAIT_TABLES, ...TURN_TABLES];
    return tableId ? [tableId] : [];
  }, [focus, tableId]);

  const highlightPressure = useMemo(() => {
    if (focus?.kind === "kpi" && focus.id === "kitchen") return KITCHEN_PRESSURE;
    if (focus?.kind === "table" && WAIT_TABLES.includes(focus.id))
      return KITCHEN_PRESSURE;
    if (focus?.kind === "pressure") return [focus.id];
    if (focus?.kind === "demand") return ["dining", "hot", "delivery"];
    return [];
  }, [focus]);

  const flowMode =
    showFlow &&
    (focus?.kind === "pressure" && focus.id === "delivery"
      ? "delivery"
      : focus?.kind === "table" || focus?.kind === "kpi"
        ? "dining"
        : "dining");

  const kpisOrdered = useMemo(() => {
    const order = ["recoverable", "kitchen", "occupancy", "walkins"];
    return [...model.kpis].sort(
      (a, b) => order.indexOf(a.id) - order.indexOf(b.id),
    );
  }, [model.kpis]);

  const selectTable = (id: string) => {
    setTableId(id);
    setFocus({ kind: "table", id });
    setInspectorTab("overview");
    setCompareOpen(false);
    setKpiOpen(null);
    setPressureOpen(null);
    if (WAIT_TABLES.includes(id)) setDemandLocked("d6");
    pushState({ table: id, view, time });
  };

  const selectKpi = (id: string) => {
    const open = kpiOpen === id ? null : id;
    setKpiOpen(open);
    setFocus(open ? { kind: "kpi", id } : null);
    if (id === "kitchen") {
      setPressureOpen("hot");
      setTableId("t8");
      setView("floor");
      pushState({ view: "floor", time, table: "t8" });
    }
    if (id === "recoverable") {
      setTableId("t8");
      pushState({ table: "t8", view, time });
    }
  };

  const selectPressure = (id: string) => {
    const next = pressureOpen === id ? null : id;
    setPressureOpen(next);
    setFocus(next ? { kind: "pressure", id } : null);
    setKpiOpen(null);
    if (id === "delivery" || id === "hot") {
      setTableId("t8");
      setShowFlow(true);
      pushState({ table: "t8", view: "floor", time });
      setView("floor");
    }
  };

  const selectDemand = (bar: DemandBar) => {
    setDemandLocked(bar.id);
    setDemandTip(bar);
    setFocus({ kind: "demand", id: bar.id });
    setKpiOpen(null);
    if (bar.time.startsWith("20:")) selectTime("20:00");
    else if (bar.time === "19:30") selectTime("+30");
    else if (bar.time.startsWith("19:")) selectTime("19:48");
    else selectTime("now");
  };

  const selectView = (id: ServiceView) => {
    setView(id);
    pushState({ view: id, time, table: tableId });
  };

  const selectTime = (id: TimeKey) => {
    setTime(id);
    pushState({ view, time: id, table: tableId });
    if (id === "+30") setDemandLocked("d3");
    if (id === "20:00" || id === "+60") setDemandLocked("d6");
    if (id === "now" || id === "19:48") setDemandLocked(null);
  };

  const applyRec = () => {
    setApplyOpen(false);
    setHandling("handling");
    setToast("HANDLING · Expedite T8 · Pre-bus T6");
    setTimeout(() => {
      setHandling("watching");
      setToast("WATCHING · Leading indicators within tolerance");
    }, 2200);
    setTimeout(() => {
      setHandling("verified");
      setToast("VERIFIED · +€84 contribution · linked to Value");
    }, 4800);
    setTimeout(() => setToast(null), 7000);
  };

  const pressureRows = model.pressure.map((r) => ({
    ...r,
    current: Math.min(99, Math.max(40, r.current + meta.shift * (r.id === "hot" || r.id === "delivery" ? 2 : 1))),
    seatNow: Math.min(99, Math.max(40, r.seatNow + meta.shift)),
    optimized: Math.min(99, Math.max(40, r.optimized + Math.max(0, meta.shift - 1))),
  }));

  return (
    <div
      className="sc-root"
      data-view={view}
      data-time={time}
      data-lens={isCfo ? "cfo" : "gm"}
      data-handling={handling}
      data-flow={showFlow ? flowMode || "dining" : undefined}
    >
      <header className="sc-head">
        <h1 className="sc-visually-hidden">Service command</h1>
        <div className="sc-ops-context" aria-label="Operating context">
          <span className="sc-ops-loc">
            {model.location} · {model.mode}
          </span>
          <span className="sc-ops-sep" aria-hidden>
            ·
          </span>
          <span className="sc-live">
            <i /> LIVE {model.liveTime}
          </span>
          {meta.mode === "forecast" ? (
            <span className="sc-mode-pill is-forecast">
              FORECAST · {meta.confidence}%
            </span>
          ) : null}
          {meta.mode === "observed" ? (
            <span className="sc-mode-pill is-observed">OBSERVED / REPLAY</span>
          ) : null}
          {handling !== "idle" ? (
            <span className={`sc-mode-pill is-${handling}`}>{handling.toUpperCase()}</span>
          ) : null}
        </div>
      </header>

      <section className="sc-top" aria-label="Operating pulse">
        <div className="sc-kpis">
          {kpisOrdered.map((k) => {
            const value =
              k.id === "occupancy"
                ? `${occupancy}%`
                : k.id === "kitchen"
                  ? `${kitchenLoad}%`
                  : k.id === "walkins"
                    ? String(walkIns)
                    : k.id === "recoverable"
                      ? recoverable
                      : k.value;
            const delta =
              k.id === "recoverable" && isCfo
                ? handling === "verified"
                  ? "Verified · Value ledger"
                  : "Decision-linked exposure"
                : k.delta;
            return (
              <button
                key={k.id}
                type="button"
                className="sc-kpi"
                data-open={kpiOpen === k.id ? "true" : undefined}
                data-active={focus?.kind === "kpi" && focus.id === k.id ? "true" : undefined}
                data-tone={k.deltaTone}
                onClick={() => selectKpi(k.id)}
              >
                <div className="sc-kpi-top">
                  <span>{k.label}</span>
                  <Spark values={k.spark} tone={k.deltaTone} />
                </div>
                <strong className={k.id === "kitchen" && kitchenLoad >= 90 ? "sc-tone-neg" : undefined}>
                  {value}
                </strong>
                <em className={`sc-tone-${k.deltaTone}`}>{delta}</em>
                {kpiOpen === k.id ? (
                  <div className="sc-kpi-pop" role="dialog">
                    {k.detail.map((d) => (
                      <div key={d.label}>
                        <span>{d.label}</span>
                        <strong>{d.value}</strong>
                      </div>
                    ))}
                    {k.id === "kitchen" ? (
                      <div className="sc-kpi-path">
                        <span>What is wrong</span>
                        <strong>Hot line + delivery collision</strong>
                        <span>RADR recommends</span>
                        <strong>Throttle delivery 12 min · expedite T8</strong>
                        <span>Expected</span>
                        <strong className="sc-tone-pos">92% → 84% · +€620</strong>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>

        <aside className="sc-insight" data-compact="true">
          <div className="sc-insight-head">
            <span className="sc-insight-kicker">RADR Sees</span>
            <span className="sc-live-pill">{meta.mode === "forecast" ? "FORECAST" : "LIVE"}</span>
          </div>
          <h2>6-table wave at 20:10</h2>
          <div className="sc-insight-compact">
            <span>
              Kitchen peak: <strong>{kitchenLoad}% → {Math.max(78, kitchenLoad - 8)}%</strong>
            </span>
            <span>
              Expected:{" "}
              <strong className="sc-tone-pos">
                {isCfo ? "+€620 protected" : "+€620 · −12 min wait"}
              </strong>
            </span>
          </div>
          <div className="sc-insight-actions">
            <button
              type="button"
              className="sc-btn-primary"
              disabled={handling === "verified"}
              onClick={() => setApplyOpen(true)}
            >
              {handling === "idle" ? "Apply plan" : handling === "verified" ? "Verified" : "Handling…"}
            </button>
            <button type="button" className="sc-btn-ghost" onClick={() => setInsightOpen(true)}>
              Details
            </button>
          </div>
        </aside>
      </section>

      <div className="sc-controls">
        <div className="sc-views" role="tablist" aria-label="Service views">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={view === v.id}
              className={view === v.id ? "is-active" : undefined}
              onClick={() => selectView(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="sc-times" role="group" aria-label="Time control">
          {TIMES.map((t) => (
            <button
              key={t.id}
              type="button"
              data-kind={t.kind}
              className={time === t.id ? "is-active" : undefined}
              onClick={() => selectTime(t.id)}
            >
              {t.label}
            </button>
          ))}
          <button
            type="button"
            className="sc-replay"
            onClick={() => selectTime("18:00")}
            title="Replay prior service"
          >
            Replay
          </button>
        </div>
      </div>

      {view === "floor" ? (
        <div className="sc-floor-row">
          <section className="sc-floor" aria-label="Floor plan">
            <div className="sc-zones" role="tablist">
              {ZONES.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  role="tab"
                  aria-selected={zone === z.id}
                  className={zone === z.id ? "is-active" : undefined}
                  onClick={() => setZone(z.id)}
                >
                  {z.label}
                </button>
              ))}
            </div>
            <div className="sc-floor-stage">
              <picture>
                <source
                  srcSet="/service/berlin-mitte-floorplan.webp"
                  type="image/webp"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={model.floorImage}
                  alt="Soho · New York fictional floor plan"
                  className="sc-floor-img"
                  width={2560}
                  height={1440}
                  decoding="async"
                />
              </picture>
              {showFlow ? <FlowOverlay mode={flowMode || "dining"} tableId={tableId} /> : null}
              <div className="sc-floor-overlay">
                {tables.map((t) => (
                  <TableMarker
                    key={t.id}
                    table={t}
                    selected={tableId === t.id}
                    highlighted={highlightTables.includes(t.id)}
                    dimmed={
                      highlightTables.length > 0 && !highlightTables.includes(t.id)
                    }
                    hovered={hoverTable === t.id}
                    onSelect={() => selectTable(t.id)}
                    onHover={setHoverTable}
                    timeShift={meta.shift}
                  />
                ))}
              </div>
              <div className="sc-floor-zoom" aria-hidden>
                <button type="button">+</button>
                <button type="button">−</button>
                <button type="button">⛶</button>
              </div>
              <div className="sc-legend">
                <span>
                  <i className="is-seated" /> Seated
                </span>
                <span>
                  <i className="is-turning" /> Turning soon
                </span>
                <span>
                  <i className="is-wait" /> Wait / Delay
                </span>
                <span>
                  <i className="is-empty" /> Empty
                </span>
                <span>
                  <i className="is-blocked" /> Blocked
                </span>
              </div>
              <button
                type="button"
                className={`sc-flow-btn${showFlow ? " is-on" : ""}`}
                onClick={() => setShowFlow((v) => !v)}
                aria-pressed={showFlow}
              >
                {showFlow ? "Hide flow" : "Show flow"}
              </button>
            </div>
          </section>

          <TableInspector
            detail={detail}
            table={selectedTable}
            tab={inspectorTab}
            onTab={setInspectorTab}
            compareOpen={compareOpen}
            onCompare={() => setCompareOpen((v) => !v)}
            onApply={() => setApplyOpen(true)}
            handling={handling}
            isCfo={isCfo}
          />
        </div>
      ) : null}

      {view === "kitchen" ? (
        <section className="sc-panel" aria-label="Kitchen">
          <h2>Kitchen · service-relevant load</h2>
          <div className="sc-kitchen-grid">
            {model.kitchen.map((s) => {
              const load = Math.min(99, s.load + (s.bottleneck ? meta.shift * 2 : meta.shift));
              const hot = highlightPressure.includes(s.id) || (s.bottleneck && focus?.kind === "kpi" && focus.id === "kitchen");
              return (
                <article
                  key={s.id}
                  data-hot={s.bottleneck || load >= 90 ? "true" : undefined}
                  data-active={hot ? "true" : undefined}
                  onClick={() => {
                    if (s.bottleneck) {
                      setFocus({ kind: "kpi", id: "kitchen" });
                      selectPressure(s.id === "pass" ? "hot" : s.id);
                    }
                  }}
                >
                  <h3>{s.name}</h3>
                  <strong className={load >= 90 ? "sc-tone-neg" : undefined}>{load}%</strong>
                  <p>
                    Queue {s.queue} · Oldest {s.oldest}
                  </p>
                  {load >= 90 ? (
                    <em>
                      RADR: {s.id === "hot" || s.id === "pass" ? "Throttle delivery · expedite T8" : "Batch & clear"}
                    </em>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {view === "staff" ? (
        <section className="sc-panel" aria-label="Staff">
          <h2>Staff · current load</h2>
          <table className="sc-staff-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Current task</th>
                <th>Load</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {model.staff.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.role}</td>
                  <td>{s.task}</td>
                  <td>{s.load}</td>
                  <td>
                    <span className={`sc-staff-status is-${s.status}`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {view === "timeline" ? (
        <section className="sc-panel" aria-label="Timeline">
          <h2>Next 120 minutes</h2>
          <div className="sc-timeline-tracks">
            {[
              { label: "Occupancy", now: occupancy, peak: 91 },
              { label: "Kitchen load", now: kitchenLoad, peak: 98 },
              { label: "Wait time", now: 14 + meta.shift * 2, peak: 22 },
              { label: "Table turns", now: 6 + meta.shift, peak: 11 },
            ].map((row) => (
              <div key={row.label} className="sc-track">
                <span>{row.label}</span>
                <div className="sc-track-bar">
                  <i style={{ width: `${Math.min(100, row.now)}%` }} className="is-now" />
                  <em style={{ left: `${row.peak}%` }} title="Peak" />
                </div>
                <strong>
                  Now {row.now}
                  {row.label === "Wait time" ? "m" : row.label.includes("turn") ? "" : "%"}
                </strong>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {view === "floor" ? (
        <div className="sc-bottom">
          <PressureModule
            rows={pressureRows}
            openId={pressureOpen}
            highlightIds={highlightPressure}
            onOpen={selectPressure}
          />
          <DemandModule
            bars={model.demand}
            meta={model.demandMeta}
            tip={demandTip}
            lockedId={demandLocked}
            onTip={setDemandTip}
            onSelect={selectDemand}
            confidence={meta.confidence}
            mode={meta.mode}
          />
        </div>
      ) : null}

      {insightOpen ? (
        <Drawer title="RADR Sees · Wave 20:10" onClose={() => setInsightOpen(false)}>
          <h3>What is wrong</h3>
          <p>6 inbound tables converge at 20:10 while kitchen load is {kitchenLoad}%.</p>
          <h3>Why</h3>
          {model.insight.why.map((w) => (
            <p key={w}>{w}</p>
          ))}
          <h3>RADR recommends</h3>
          <p>Pre-bus Tables 6 and 12 · move 2 terrace tables · prepare kitchen.</p>
          <h3>Expected outcome</h3>
          <ul className="sc-insight-expect">
            {model.insight.expected.map((e) => (
              <li key={e.label}>
                <strong>{e.value}</strong>
                <span>{e.label}</span>
              </li>
            ))}
          </ul>
          <h3>Confidence</h3>
          <p>{model.insight.confidence} · {meta.mode === "forecast" ? `${meta.confidence}% forecast` : "Live sources healthy"}</p>
          <div className="sc-drawer-actions">
            <Link href="/app/decisions?decision=dec_labor_berlin&stay=1" className="sc-btn-secondary">
              Open Decision
            </Link>
            <button type="button" className="sc-btn-primary" onClick={() => { setInsightOpen(false); setApplyOpen(true); }}>
              Apply plan
            </button>
          </div>
        </Drawer>
      ) : null}

      {applyOpen ? (
        <Drawer title="Apply plan" onClose={() => setApplyOpen(false)}>
          <h3>Actions</h3>
          <ul className="sc-apply-list">
            <li>Expedite Table 8 mains</li>
            <li>Pre-bus Table 6</li>
          </ul>
          <h3>Expected</h3>
          <ul className="sc-insight-expect">
            <li>
              <strong>−14 min</strong>
              <span>wait</span>
            </li>
            <li>
              <strong>+€84</strong>
              <span>contribution</span>
            </li>
            <li>
              <strong>+12%</strong>
              <span>guest satisfaction</span>
            </li>
          </ul>
          <h3>Confidence</h3>
          <p>87%</p>
          <div className="sc-drawer-actions">
            <button type="button" className="sc-btn-secondary" onClick={() => setApplyOpen(false)}>
              Cancel
            </button>
            <button type="button" className="sc-btn-primary" onClick={applyRec}>
              Apply
            </button>
          </div>
        </Drawer>
      ) : null}

      {toast ? (
        <div className="sc-toast" role="status">
          {toast}{" "}
          {handling === "verified" ? (
            <Link href="/app/value?stay=1">Open Value →</Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function FlowOverlay({ mode, tableId }: { mode: string; tableId: string }) {
  const t =
    tableId === "t8"
      ? { x: 49.2, y: 48.2 }
      : tableId === "t6"
        ? { x: 18.5, y: 47.1 }
        : { x: 49.2, y: 48.2 };
  return (
    <svg className="sc-flow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      {mode === "delivery" ? (
        <>
          <path className="sc-flow-path" d="M8 12 C 20 18, 30 28, 42 38" />
          <path className="sc-flow-path" d="M42 38 C 48 44, 52 48, 56 46" />
          <circle className="sc-flow-pulse" r="1.2">
            <animateMotion dur="2.4s" repeatCount="indefinite" path="M8 12 C 20 18, 30 28, 42 38 C 48 44, 52 48, 56 46" />
          </circle>
        </>
      ) : (
        <>
          <path className="sc-flow-path" d={`M72 18 C 68 28, 62 36, ${t.x} ${t.y}`} />
          <path className="sc-flow-path" d={`M88 22 C 80 30, 70 40, ${t.x} ${t.y}`} />
          <circle className="sc-flow-pulse" r="1.2">
            <animateMotion
              dur="2.2s"
              repeatCount="indefinite"
              path={`M72 18 C 68 28, 62 36, ${t.x} ${t.y}`}
            />
          </circle>
        </>
      )}
    </svg>
  );
}

function TableMarker({
  table,
  selected,
  highlighted,
  dimmed,
  hovered,
  onSelect,
  onHover,
  timeShift,
}: {
  table: FloorTable;
  selected: boolean;
  highlighted: boolean;
  dimmed: boolean;
  hovered: boolean;
  onSelect: () => void;
  onHover: (id: string | null) => void;
  timeShift: number;
}) {
  const wait =
    table.waitMin != null ? Math.min(40, table.waitMin + timeShift * 2) : null;
  const state =
    table.tone === "turning"
      ? "Pre-bus"
      : table.tone === "wait" && wait != null
        ? `${wait} min`
        : table.tone === "empty"
          ? "Empty"
          : table.tone === "blocked"
            ? "Hold"
            : table.statusLabel;

  return (
    <button
      type="button"
      className="sc-marker"
      data-tone={table.tone}
      data-selected={selected ? "true" : undefined}
      data-hit={highlighted ? "true" : undefined}
      data-dim={dimmed ? "true" : undefined}
      style={{ left: `${table.x}%`, top: `${table.y}%` }}
      onClick={onSelect}
      onMouseEnter={() => onHover(table.id)}
      onMouseLeave={() => onHover(null)}
      aria-label={`Table ${table.n}`}
    >
      <span className="sc-marker-core">
        <strong className="sc-marker-n">{table.n}</strong>
        {table.party ? (
          <span className="sc-marker-party">{table.party}p</span>
        ) : null}
        <em className="sc-marker-state">{state}</em>
      </span>
      {table.tone === "wait" ? (
        <span className="sc-marker-badge" aria-hidden />
      ) : null}
      {hovered || selected ? (
        <div className="sc-marker-tip" role="tooltip">
          <strong>Table {table.n}</strong>
          <div>{table.stage || table.statusLabel}</div>
          {table.seatedMin != null ? <div>Seated {table.seatedMin} min</div> : null}
          {wait != null ? <div>Wait {wait} min</div> : null}
          {table.tone === "turning" ? <div>Expected turn · 8 min</div> : null}
        </div>
      ) : null}
    </button>
  );
}

function TableInspector({
  detail,
  table,
  tab,
  onTab,
  compareOpen,
  onCompare,
  onApply,
  handling,
  isCfo,
}: {
  detail: ReturnType<typeof getServiceCommand>["tableDetails"][string];
  table?: FloorTable;
  tab: string;
  onTab: (t: string) => void;
  compareOpen: boolean;
  onCompare: () => void;
  onApply: () => void;
  handling: Handling;
  isCfo: boolean;
}) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "guests", label: `Guests (${table?.party ?? 4})` },
    { id: "order", label: "Order" },
    { id: "kitchen", label: "Kitchen" },
    { id: "staff", label: "Staff" },
    { id: "history", label: "History" },
  ];

  return (
    <aside className="sc-inspector" aria-label="Table inspector">
      <header>
        <div className="sc-insp-title">
          <h2>{detail.title}</h2>
          <span className={`sc-badge is-${detail.statusTone}`}>
            {handling !== "idle" && detail.tableId === "t8"
              ? handling === "verified"
                ? "Verified"
                : handling === "watching"
                  ? "Watching"
                  : "Handling"
              : detail.status}
          </span>
        </div>
        <p>{detail.meta}</p>
      </header>
      <div className="sc-insp-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? "is-active" : undefined}
            onClick={() => onTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="sc-insp-body">
        {tab === "overview" ? (
          <>
            <div className="sc-alert">
              <strong>{detail.problem}</strong>
              {detail.context.map((c) => (
                <p key={c}>{c}</p>
              ))}
            </div>
            <div className="sc-rec">
              <div className="sc-rec-head">
                <span>RADR recommends</span>
                <em>{detail.confidence} confidence</em>
              </div>
              <p>{detail.recommendation}</p>
              {isCfo ? (
                <p className="sc-cfo-note">
                  <strong>Financial lens</strong>
                  <br />
                  {detail.outcomes.find((o) => o.value.includes("€"))?.value ?? "+€84"}{" "}
                  contribution at risk. Delay compounds if the 20:10 wave is seated
                  without intervention.
                </p>
              ) : null}
              <div className="sc-rec-actions">
                <button
                  type="button"
                  className="sc-btn-primary"
                  disabled={handling === "verified"}
                  onClick={onApply}
                >
                  Apply recommendation
                </button>
                <button type="button" className="sc-btn-secondary" onClick={onCompare}>
                  Compare impact
                </button>
              </div>
            </div>
            {compareOpen ? (
              <div className="sc-compare">
                <article>
                  <h4>Do nothing</h4>
                  <ul>
                    {detail.doNothing.map((r) => (
                      <li key={r.label}>
                        <span>{r.label}</span>
                        <strong className="sc-tone-neg">{r.value}</strong>
                      </li>
                    ))}
                  </ul>
                </article>
                <article className="is-radr">
                  <h4>RADR action</h4>
                  <ul>
                    {detail.withRadr.map((r) => (
                      <li key={r.label}>
                        <span>{r.label}</span>
                        <strong className="sc-tone-pos">{r.value}</strong>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            ) : null}
            <div className="sc-outcomes">
              {detail.outcomes.map((o) => (
                <article key={o.label}>
                  <strong>{o.value}</strong>
                  <span>{o.label}</span>
                </article>
              ))}
            </div>
          </>
        ) : null}
        {tab === "guests" ? (
          <div className="sc-tab-block">
            <p>Party of {table?.party ?? 4} · Dine-in · No VIP flag</p>
            <p>Repeat guest: possible (2 prior visits at Soho · New York)</p>
            <p>Notes: Anniversary — prefer quieter section if available</p>
          </div>
        ) : null}
        {tab === "order" ? (
          <div className="sc-tab-block">
            <p>Course: Mains · Ticket age: {table?.waitMin ?? 19} min</p>
            <p>Expected spend: €180 · Contribution at risk: €84</p>
            <p>Items on hold: 2 mains (Hot)</p>
          </div>
        ) : null}
        {tab === "kitchen" ? (
          <div className="sc-tab-block">
            <p>Dependency: Hot → Pass</p>
            <p>Queue position: 3 · Oldest related ticket: 19 min</p>
            <p>Bottleneck: Hot line 96%</p>
          </div>
        ) : null}
        {tab === "staff" ? (
          <div className="sc-tab-block">
            <p>Server: John · Section: Main A</p>
            <p>Workload: High · Next touch: check-back overdue</p>
          </div>
        ) : null}
        {tab === "history" ? (
          <div className="sc-tab-block">
            <p>18:40 Seated</p>
            <p>19:05 Starters fired</p>
            <p>19:29 Mains ticket · wait clock started</p>
            <p>19:48 RADR recommendation prepared</p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function PressureModule({
  rows,
  openId,
  highlightIds,
  onOpen,
}: {
  rows: PressureRow[];
  openId: string | null;
  highlightIds: string[];
  onOpen: (id: string) => void;
}) {
  const open = rows.find((r) => r.id === openId);
  return (
    <section className="sc-module sc-module-light" aria-label="Service pressure">
      <header>
        <h2>Service pressure</h2>
        <span>Current · Seat-now · Optimized</span>
      </header>
      <table className="sc-pressure">
        <thead>
          <tr>
            <th>Area</th>
            <th>Current</th>
            <th>Seat-now</th>
            <th>Optimized</th>
            <th>Δ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const delta = r.optimized - r.current;
            return (
              <tr
                key={r.id}
                data-active={openId === r.id ? "true" : undefined}
                data-hit={highlightIds.includes(r.id) ? "true" : undefined}
                onClick={() => onOpen(r.id)}
              >
                <td>{r.label}</td>
                <td>
                  <PressureBar value={r.current} />
                </td>
                <td>
                  <PressureBar value={r.seatNow} />
                </td>
                <td>
                  <PressureBar value={r.optimized} tone="opt" />
                </td>
                <td className={delta < 0 ? "sc-tone-pos" : delta > 0 ? "sc-tone-neg" : undefined}>
                  {delta > 0 ? `+${delta}pp` : `${delta}pp`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {open ? (
        <div className="sc-pressure-detail">
          <strong>{open.label}</strong>
          <p>
            Current {open.current}% · Seat-now {open.seatNow}% · Optimized {open.optimized}%
          </p>
          <p>
            <em>Cause:</em> {open.cause}
          </p>
          <p>
            <em>Affected:</em>{" "}
            {open.id === "delivery" || open.id === "hot"
              ? "Hot line · Pass · Tables 2, 4, 8, 9"
              : "Dining turns · inbound wave"}
          </p>
          <p>
            <em>Action:</em> {open.recommendation} · Expected {open.expectedValue}
          </p>
          <Link href="/app/decisions?stay=1" className="sc-link">
            Open related Decision →
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function PressureBar({ value, tone }: { value: number; tone?: "opt" }) {
  const level = value >= 90 ? "hot" : value >= 80 ? "warm" : "ok";
  return (
    <span className="sc-pbar" data-level={tone === "opt" ? "opt" : level}>
      <i style={{ width: `${value}%` }} />
      <em>{value}%</em>
    </span>
  );
}

function DemandModule({
  bars,
  meta,
  tip,
  lockedId,
  onTip,
  onSelect,
  confidence,
  mode,
}: {
  bars: DemandBar[];
  meta: { label: string; value: string }[];
  tip: DemandBar | null;
  lockedId: string | null;
  onTip: (b: DemandBar | null) => void;
  onSelect: (b: DemandBar) => void;
  confidence?: number;
  mode: string;
}) {
  const max = Math.max(...bars.map((b) => Math.max(b.current, b.expected)));
  const shown = tip || bars.find((b) => b.id === lockedId) || null;
  return (
    <section className="sc-module sc-module-light" aria-label="Upcoming demand">
      <header>
        <h2>Upcoming demand</h2>
        <span>
          Next 2h · current vs expected
          {mode === "forecast" && confidence ? ` · ${confidence}% conf` : ""}
        </span>
      </header>
      <div className="sc-demand-chart">
        {bars.map((b) => (
          <button
            key={b.id}
            type="button"
            className="sc-demand-col"
            data-locked={lockedId === b.id ? "true" : undefined}
            onMouseEnter={() => onTip(b)}
            onMouseLeave={() => onTip(null)}
            onClick={() => onSelect(b)}
          >
            <div className="sc-demand-bars">
              <span style={{ height: `${(b.current / max) * 100}%` }} className="is-current" />
              <span style={{ height: `${(b.expected / max) * 100}%` }} className="is-expected" />
            </div>
            {b.peak ? <em className="sc-peak">{b.peak}</em> : null}
            <span className="sc-demand-time">{b.time}</span>
          </button>
        ))}
      </div>
      {shown ? (
        <div className="sc-demand-tip">
          <strong>{shown.time}</strong> · {shown.covers} covers · {shown.parties} parties ·{" "}
          {shown.walkIns} walk-ins · delivery impact ·{" "}
          {shown.note || "VIP/weather in meta"} · conf{" "}
          {confidence ?? 88}%
        </div>
      ) : (
        <div className="sc-demand-tip sc-demand-tip-quiet">Click a bucket to lock forecast state</div>
      )}
      <ul className="sc-demand-meta">
        {meta.map((m) => (
          <li key={m.label}>
            <strong>{m.value}</strong>
            <span>{m.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Drawer({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="sc-drawer" role="dialog" aria-label={title}>
      <button type="button" className="sc-drawer-scrim" aria-label="Close" onClick={onClose} />
      <div className="sc-drawer-card">
        <header>
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="sc-drawer-body">{children}</div>
      </div>
    </div>
  );
}
