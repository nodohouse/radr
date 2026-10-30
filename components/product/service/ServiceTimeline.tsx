"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  getConnectedScenario,
  setServiceTime,
  setServiceView,
  subscribeConnected,
} from "@/lib/radr/product/connectedState";
import { berlinServiceSnapshots } from "@/data/demo/serviceMap";
import type { BerlinServiceUniverse } from "@/lib/radr/service/universe";
import type {
  GuestFlexibility,
  RecoverableCapacityOpportunity,
  ServiceReservation,
  TimelineBlock,
  UnfulfilledDemand,
  WalkInParty,
} from "@/lib/radr/service/types";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

const HOURS = [
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
] as const;

const AREAS = ["MAIN", "BAR", "TERRACE"] as const;

/** Inbound-wave pressure window — same window the Floor rail names. */
const PRESSURE_WINDOW = { start: "20:10", end: "20:35" } as const;

/** Venue clock the waiting / walk-in snapshot is taken at. */
const SNAPSHOT_NOW = "19:48";

function parseHm(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function formatHm(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const DAY_START = parseHm("17:00");
const DAY_END = parseHm("23:00");
const SPAN = DAY_END - DAY_START;

function pct(hm: string): number {
  const t = Math.min(DAY_END, Math.max(DAY_START, parseHm(hm)));
  return ((t - DAY_START) / SPAN) * 100;
}

function widthPct(start: string, end: string): number {
  return Math.max(1.5, pct(end) - pct(start));
}

const SOURCE_LABEL: Record<string, string> = {
  opentable: "OpenTable",
  sevenrooms: "SevenRooms",
  resy: "Resy",
  thefork: "TheFork",
  quandoo: "Quandoo",
  website: "Website",
  walk_in: "Walk-in",
  demo: "Demo",
};

const humanize = (s: string) => s.replace(/_/g, " ");
const tableName = (id: string) => id.replace(/^t/i, "T");

/* ——— Waiting / walk-in rows ——— */

type WaitingRow = {
  id: string;
  kind: "walk_in" | "waiting";
  label: string;
  partySize: number;
  start: string;
  end: string;
  note: string;
  ref:
    | { type: "walkIn"; walkIn: WalkInParty }
    | { type: "demand"; demand: UnfulfilledDemand };
};

function waitingRows(universe: BerlinServiceUniverse): WaitingRow[] {
  const now = parseHm(SNAPSHOT_NOW);
  const rows: WaitingRow[] = [];

  for (const w of universe.walkIns) {
    rows.push({
      id: `wr_${w.id}`,
      kind: "walk_in",
      label: w.partyLabel,
      partySize: w.partySize,
      start: formatHm(now - w.waitMinutes),
      end: formatHm(now + w.estimatedSeatMinutes),
      note: humanize(w.state),
      ref: { type: "walkIn", walkIn: w },
    });
  }

  for (const d of universe.demand) {
    if (d.state !== "waiting") continue;
    const pref = parseHm(d.preferredTime);
    const from = pref + (d.flexibility.earliestMinutes ?? 0);
    const to = pref + (d.flexibility.latestMinutes ?? 30);
    rows.push({
      id: `wr_${d.id}`,
      kind: "waiting",
      label: d.partyLabel,
      partySize: d.partySize,
      start: formatHm(from),
      end: formatHm(Math.max(to, from + 20)),
      note: SOURCE_LABEL[d.source] ?? d.source,
      ref: { type: "demand", demand: d },
    });
  }
  return rows;
}

/* ——— Drawer model ——— */

type Fact = { key: string; label: string; value: string };

type DrawerModel = {
  kicker: string;
  title: string;
  facts: Fact[];
  flexibility: string[];
  signal: string | null;
  decisionId?: string;
  recoverable: boolean;
};

type Selection =
  | { type: "block"; block: TimelineBlock }
  | { type: "waiting"; row: WaitingRow };

function flexibilityParts(f: GuestFlexibility | undefined): string[] {
  if (!f) return [];
  const parts: string[] = [];
  if (f.earliestMinutes != null && f.earliestMinutes !== 0) {
    parts.push(`Earlier ${Math.abs(f.earliestMinutes)} min`);
  }
  if (f.latestMinutes != null && f.latestMinutes !== 0) {
    parts.push(`Later ${f.latestMinutes} min`);
  }
  if (f.areaPreferences?.length) parts.push(f.areaPreferences.join(" · "));
  if (f.terraceOk) parts.push("Terrace OK");
  if (f.accessibility) parts.push("Accessible");
  if (f.highChair) parts.push("High chair");
  if (f.vip) parts.push("VIP");
  if (f.returning) parts.push("Returning");
  return parts;
}

function tablePressure(tableId: string): number | null {
  const snap = berlinServiceSnapshots()[SNAPSHOT_NOW];
  const unit = snap?.units.find((u) => u.id === tableId);
  return unit?.pressure ?? null;
}

function sizeLabel(opp: RecoverableCapacityOpportunity): string {
  const { min, max } = opp.partySizeFit;
  return min === max ? `${min}` : `${min}–${max}`;
}

function describe(
  sel: Selection,
  universe: BerlinServiceUniverse,
): DrawerModel {
  const facts: Fact[] = [];
  const add = (key: string, label: string, value: string | null | undefined) => {
    if (value != null && value !== "") facts.push({ key, label, value });
  };

  if (sel.type === "block") {
    const b = sel.block;
    const res: ServiceReservation | undefined = b.reservationId
      ? universe.reservations.find((r) => r.id === b.reservationId)
      : undefined;
    const opp =
      b.kind === "recoverable"
        ? universe.opportunities.find(
            (o) => o.tableIds.includes(b.tableId) && o.start === b.start,
          )
        : undefined;
    const hold =
      b.material === "decision"
        ? universe.walkIns.find((w) => w.compatibleTableIds.includes(b.tableId))
        : undefined;

    add(
      "party",
      "Party",
      res?.partyLabel ?? hold?.partyLabel ?? (opp ? "Open capacity" : null),
    );
    add(
      "size",
      "Size",
      String(res?.partySize ?? b.partySize ?? hold?.partySize ?? "") ||
        (opp ? sizeLabel(opp) : null),
    );
    add("table", "Table", tableName(b.tableId));
    add("arrival", "Arrival", res?.start ?? b.start);
    add(
      "release",
      "Release",
      res
        ? (res.actualReleased ?? res.expectedEnd)
        : b.end,
    );
    add(
      "confidence",
      "Confidence",
      res
        ? `${Math.round(res.confidence * 100)}%`
        : opp
          ? `${Math.round(opp.confidence * 100)}%`
          : null,
    );
    const pressure = tablePressure(b.tableId);
    add(
      "pressure",
      "Pressure",
      pressure != null
        ? `${pressure}%`
        : opp
          ? humanize(opp.operationalImpact)
          : null,
    );
    const euro = b.contributionEuro ?? res?.expectedContributionEuro;
    add("economic", "Economic", euro != null ? formatDecisionMoney(euro) : null);
    add("kind", "Kind", humanize(b.kind));
    add("state", "State", humanize(b.state));
    if (res) add("source", "Source", SOURCE_LABEL[res.source] ?? res.source);

    return {
      kicker: `${b.tableId.replace(/^t/i, "Table ")} · ${b.start}–${b.end}`,
      title: b.label,
      facts,
      flexibility: flexibilityParts(res?.flexibility),
      signal: b.material ? humanize(b.material) : null,
      decisionId: b.decisionId ?? opp?.decisionId,
      recoverable: b.kind === "recoverable",
    };
  }

  const row = sel.row;
  const ref = row.ref;
  if (ref.type === "demand") {
    const d = ref.demand;
    const opps = universe.opportunities.filter((o) =>
      o.compatibleDemandIds.includes(d.id),
    );
    const bestOpp = opps[0];
    add("party", "Party", d.partyLabel);
    add("size", "Size", String(d.partySize));
    add(
      "table",
      "Table",
      opps.length
        ? opps.flatMap((o) => o.tableIds.map(tableName)).join(" / ")
        : null,
    );
    add("arrival", "Arrival", d.preferredTime);
    add("release", "Release", bestOpp?.end ?? null);
    add(
      "confidence",
      "Confidence",
      bestOpp ? `${Math.round(bestOpp.confidence * 100)}%` : null,
    );
    add(
      "pressure",
      "Pressure",
      bestOpp ? humanize(bestOpp.operationalImpact) : null,
    );
    add("economic", "Economic", formatDecisionMoney(d.expectedContributionEuro));
    add("source", "Source", SOURCE_LABEL[d.source] ?? d.source);
    if (d.waitMinutes != null) add("wait", "Waiting", `${d.waitMinutes} min`);
    return {
      kicker: "Waiting demand",
      title: `${d.partyLabel} · ${d.partySize}`,
      facts,
      flexibility: flexibilityParts(d.flexibility),
      signal: "waiting demand",
      decisionId: bestOpp?.decisionId,
      recoverable: opps.length > 0,
    };
  }

  const w = ref.walkIn;
  add("party", "Party", w.partyLabel);
  add("size", "Size", String(w.partySize));
  add("table", "Table", w.compatibleTableIds.map(tableName).join(" / "));
  add("arrival", "Arrival", row.start);
  add("release", "Release", `~${row.end}`);
  add("wait", "Waiting", `${w.waitMinutes} min`);
  add("state", "State", humanize(w.state));
  const t6 = w.compatibleTableIds.includes("t6");
  const pressure = t6 ? tablePressure("t6") : null;
  add("pressure", "Pressure", pressure != null ? `${pressure}%` : null);
  return {
    kicker: "Walk-in queue",
    title: `${w.partyLabel} · ${w.partySize}`,
    facts,
    flexibility: [],
    signal: null,
    decisionId: t6 ? universe.decisionPeakId : undefined,
    recoverable: false,
  };
}

type Props = { universe: BerlinServiceUniverse };

export function ServiceTimeline({ universe }: Props) {
  const connected = useSyncExternalStore(
    subscribeConnected,
    getConnectedScenario,
    getConnectedScenario,
  );
  const [selected, setSelected] = useState<Selection | null>(null);
  const now = connected.serviceTime;
  const nowPct = pct(now);

  const byArea = useMemo(() => {
    const map = new Map<string, Map<string, TimelineBlock[]>>();
    for (const area of AREAS) map.set(area, new Map());
    for (const b of universe.timeline) {
      const areaMap = map.get(b.area) ?? new Map();
      const list = areaMap.get(b.tableId) ?? [];
      list.push(b);
      areaMap.set(b.tableId, list);
      map.set(b.area, areaMap);
    }
    // Ensure known tables appear even without blocks
    for (const area of AREAS) {
      const areaMap = map.get(area)!;
      const tables = universe.timeline
        .filter((b) => b.area === area)
        .map((b) => b.tableId);
      for (const t of new Set(tables)) {
        if (!areaMap.has(t)) areaMap.set(t, []);
      }
    }
    return map;
  }, [universe.timeline]);

  const waiting = useMemo(() => waitingRows(universe), [universe]);
  const model = selected ? describe(selected, universe) : null;
  const selectedBlockId = selected?.type === "block" ? selected.block.id : null;
  const selectedRowId = selected?.type === "waiting" ? selected.row.id : null;

  return (
    <div className="rp-stl">
      <header className="rp-stl-head">
        <div>
          <p className="rp-svc-kicker">Timeline</p>
          <h2>Service clock</h2>
          <p>
            Material exceptions only — late risk, turn risk, recoverable gaps,
            Decisions.
          </p>
        </div>
        <div className="rp-stl-clock" role="tablist" aria-label="Service time">
          {(["18:00", "19:00", "19:48", "20:00", "21:00"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={connected.serviceTime === t}
              data-active={connected.serviceTime === t ? "true" : undefined}
              onClick={() => setServiceTime(t)}
            >
              {t === "19:48" ? "NOW" : t}
            </button>
          ))}
        </div>
      </header>

      <div className="rp-stl-board">
        <div className="rp-stl-canvas">
          <div className="rp-stl-hours" aria-hidden="true">
            {HOURS.map((h) => (
              <span key={h} style={{ left: `${pct(h)}%` }}>
                {h}
              </span>
            ))}
          </div>

          {/* Overlay: pressure window + NOW line share the track coordinate space */}
          <div className="rp-stl-overlay" aria-hidden="true">
            <div
              className="rp-stl-pressure"
              style={{
                left: `${pct(PRESSURE_WINDOW.start)}%`,
                width: `${widthPct(PRESSURE_WINDOW.start, PRESSURE_WINDOW.end)}%`,
              }}
            >
              <em>
                Pressure {PRESSURE_WINDOW.start}–{PRESSURE_WINDOW.end}
              </em>
            </div>
            <div className="rp-stl-now" style={{ left: `${nowPct}%` }}>
              <em>NOW</em>
            </div>
          </div>

          {AREAS.map((area) => {
            const tables = [...(byArea.get(area)?.entries() ?? [])].sort(
              (a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }),
            );
            if (!tables.length) return null;
            return (
              <section key={area} className="rp-stl-area" aria-label={area}>
                <h3>{area}</h3>
                <ul>
                  {tables.map(([tableId, blocks]) => (
                    <li key={tableId} className="rp-stl-row">
                      <button
                        type="button"
                        className="rp-stl-table"
                        onClick={() => {
                          setServiceView("floor");
                        }}
                      >
                        {tableId.replace(/^t/i, "T")}
                      </button>
                      <div className="rp-stl-track">
                        {blocks.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            className="rp-stl-block"
                            data-kind={b.kind}
                            data-material={b.material ?? undefined}
                            data-selected={
                              selectedBlockId === b.id ? "true" : undefined
                            }
                            style={{
                              left: `${pct(b.start)}%`,
                              width: `${widthPct(b.start, b.end)}%`,
                            }}
                            onClick={() => setSelected({ type: "block", block: b })}
                          >
                            <strong>{b.label}</strong>
                            {b.material ? <em>{humanize(b.material)}</em> : null}
                          </button>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          {waiting.length ? (
            <section
              className="rp-stl-area"
              data-group="waiting"
              aria-label="Waiting and walk-ins"
            >
              <h3>Waiting / Walk-ins</h3>
              <ul>
                {waiting.map((r) => (
                  <li key={r.id} className="rp-stl-row" data-kind={r.kind}>
                    <span className="rp-stl-table rp-stl-table-static">
                      {r.label}
                      <em>{r.partySize}</em>
                    </span>
                    <div className="rp-stl-track">
                      <button
                        type="button"
                        className="rp-stl-block"
                        data-kind={r.kind}
                        data-selected={
                          selectedRowId === r.id ? "true" : undefined
                        }
                        style={{
                          left: `${pct(r.start)}%`,
                          width: `${widthPct(r.start, r.end)}%`,
                        }}
                        onClick={() => setSelected({ type: "waiting", row: r })}
                      >
                        <strong>{r.note}</strong>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>

      {model ? (
        <aside className="rp-stl-drawer" aria-label="Timeline detail">
          <header>
            <p className="rp-svc-kicker">{model.kicker}</p>
            <h3>{model.title}</h3>
            <button
              type="button"
              className="rp-stl-close"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </header>
          <dl>
            {model.facts.map((f) => (
              <div key={f.key} data-fact={f.key}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
            {model.flexibility.length ? (
              <div data-fact="flexibility">
                <dt>Flexibility</dt>
                <dd>
                  <ul className="rp-stl-chips">
                    {model.flexibility.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
            {model.signal ? (
              <div data-fact="signal">
                <dt>Material signal</dt>
                <dd>{model.signal}</dd>
              </div>
            ) : null}
            {model.decisionId ? (
              <div data-fact="decision">
                <dt>Decision</dt>
                <dd>{displayDecisionId(model.decisionId)}</dd>
              </div>
            ) : null}
          </dl>
          {model.decisionId ? (
            <Link
              href={`/app/decisions/${model.decisionId}`}
              className="rp-svc-cta"
            >
              Open {displayDecisionId(model.decisionId)} →
            </Link>
          ) : null}
          {model.recoverable ? (
            <button
              type="button"
              className="rp-svc-cta"
              onClick={() => setServiceView("recovery")}
            >
              View recoverable demand →
            </button>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}
