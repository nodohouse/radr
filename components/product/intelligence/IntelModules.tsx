"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import type { LiveServicePerformance } from "@/lib/radr/intelligence/liveService";
import type { TopDishesReport } from "@/lib/radr/intelligence/topDishes";
import type {
  MenuContributionReport,
  MetricModuleReport,
  SettlementBridgeReport,
  SupplierVarianceSummary,
} from "@/lib/radr/intelligence/opsModules";
import { useIntelligencePinsOptional } from "./IntelligencePinContext";
import type { IntelModuleDef } from "@/lib/radr/intelligence/moduleRegistry";

export function PinButton({ moduleId }: { moduleId: string }) {
  const pins = useIntelligencePinsOptional();
  if (!pins) return null;
  const on = pins.isPinned(moduleId);
  return (
    <button
      type="button"
      className="rp-intel-pin"
      aria-pressed={on}
      aria-label={on ? "On Control Center" : "Add to Control Center"}
      title={on ? "On Control Center" : "Add to Control Center"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        pins.togglePin(moduleId);
      }}
    >
      {on ? "★" : "☆"}
    </button>
  );
}

export function ModuleShell({
  def,
  children,
  compact,
  instrument,
  period,
}: {
  def: IntelModuleDef;
  children: React.ReactNode;
  compact?: boolean;
  instrument?: boolean;
  period?: string;
}) {
  return (
    <article
      className={`rp-intel-mod${instrument ? " rp-instrument" : ""}`}
      data-size={compact ? "compact" : def.defaultSize}
      data-id={def.id}
      data-instrument={instrument ? "true" : undefined}
    >
      <header className="rp-intel-mod-head">
        <div>
          <h3>{def.title}</h3>
          <p>
            {period ? `${period} · ` : ""}
            {def.description}
          </p>
        </div>
        {def.pinningSupported ? <PinButton moduleId={def.id} /> : null}
      </header>
      {children}
    </article>
  );
}

export function RadrRead({
  text,
  judgment,
  decisionId,
  state,
}: {
  text: string;
  judgment: string;
  decisionId?: string | null;
  state?: string;
}) {
  return (
    <div className="rp-intel-read">
      <p className="rp-intel-read-body">{text}</p>
      <p className="rp-intel-judgment" data-j={judgment}>
        {(state ?? judgment).replace(/_/g, " ")}
      </p>
      {decisionId ? (
        <Link href={`/app/decisions/${decisionId}`} className="rp-intel-dec-link">
          {displayDecisionId(decisionId)} · View Decision →
        </Link>
      ) : null}
    </div>
  );
}

function MiniSpark({
  spark,
  dark,
}: {
  spark: { label: string; actual: number; compare: number }[];
  dark?: boolean;
}) {
  if (!spark.length) return null;
  const w = 320;
  const h = 72;
  const pad = 8;
  const max = Math.max(...spark.map((s) => Math.max(s.actual, s.compare)), 1);
  const pts = spark.map((s, i) => {
    const x = pad + (i / Math.max(spark.length - 1, 1)) * (w - pad * 2);
    const yA = h - pad - (s.actual / max) * (h - pad * 2);
    const yC = h - pad - (s.compare / max) * (h - pad * 2);
    return { x, yA, yC };
  });
  const a = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yA}`).join(" ");
  const c = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yC}`).join(" ");
  const stroke = dark ? "rgba(247,250,248,0.85)" : "#0a0d0b";
  const muted = dark ? "rgba(247,250,248,0.28)" : "rgba(10,13,11,0.22)";
  return (
    <svg
      className="rp-intel-spark"
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-hidden="true"
    >
      <path d={c} fill="none" stroke={muted} strokeWidth="1.2" strokeDasharray="3 3" />
      <path d={a} fill="none" stroke={stroke} strokeWidth="1.6" />
    </svg>
  );
}

export function MetricModule({
  def,
  data,
}: {
  def: IntelModuleDef;
  data: MetricModuleReport;
}) {
  return (
    <ModuleShell def={def} period={data.periodLabel}>
      <p className="rp-intel-compare-type">{data.comparisonType}</p>
      <div className="rp-intel-metric-hero">
        <strong>{data.primaryValue}</strong>
        <em>{data.primaryLabel}</em>
      </div>
      <p className="rp-intel-meta">
        {data.comparisonValue}
        <span> · {data.comparisonLabel}</span>
      </p>
      {data.spark ? <MiniSpark spark={data.spark} /> : null}
      {data.healthNote ? (
        <p className="rp-intel-health-warn">
          {data.state === "STALE" ? "DATA STALE · " : ""}
          {data.healthNote}{" "}
          <Link href="/app/data-health">View Data Health →</Link>
        </p>
      ) : null}
      {data.needsData ? (
        <p className="rp-intel-empty">
          {data.needsData}{" "}
          <Link href="/app/connections">Connect source →</Link>
        </p>
      ) : null}
      <RadrRead
        text={data.radrRead}
        judgment={data.judgment}
        decisionId={data.relatedDecisionId}
        state={data.state}
      />
    </ModuleShell>
  );
}

export function LiveServiceModule({
  data,
  def,
}: {
  data: LiveServicePerformance;
  def: IntelModuleDef;
}) {
  if (!data.active) {
    return (
      <ModuleShell def={def}>
        <p className="rp-intel-empty">{data.radrRead}</p>
        {data.nextServiceLabel ? (
          <p className="rp-intel-meta">{data.nextServiceLabel}</p>
        ) : null}
        <RadrRead text={data.radrRead} judgment={data.judgment} state="NO_ACTION" />
      </ModuleShell>
    );
  }

  const w = 560;
  const h = 168;
  const pad = 22;
  const maxR = Math.max(
    ...data.series.map((s) => Math.max(s.actualRevenue, s.forecastRevenue)),
    1,
  );
  const pts = data.series.map((s, i) => {
    const x = pad + (i / Math.max(data.series.length - 1, 1)) * (w - pad * 2);
    const showActual = s.observed;
    const yA =
      h - pad - ((showActual ? s.actualRevenue : s.forecastRevenue) / maxR) * (h - pad * 2);
    const yF = h - pad - (s.forecastRevenue / maxR) * (h - pad * 2);
    return { x, yA, yF, s, showActual };
  });
  const actualPath = pts
    .filter((p) => p.showActual)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yA}`)
    .join(" ");
  const forecastPath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yF}`)
    .join(" ");
  const nowPt = pts.find((p) => p.s.label === "NOW");

  return (
    <ModuleShell def={def} period={`Live · ${data.clockLabel}`}>
      <div className="rp-intel-live-head">
        <div>
          <p className="rp-intel-live-loc">
            <span className="rp-intel-live-dot" aria-hidden="true" />
            {data.locationLabel} · {data.serviceType}
          </p>
          <p className="rp-intel-live-clock">Live · {data.clockLabel}</p>
        </div>
        <div className="rp-intel-live-nums">
          <div>
            <strong>{formatDecisionMoney(data.revenue)}</strong>
            <em>Revenue so far</em>
          </div>
          <div>
            <strong>
              {data.revenueDeltaPct >= 0 ? "+" : ""}
              {data.revenueDeltaPct}%
            </strong>
            <em>vs expected · {formatDecisionMoney(data.forecastAtNow)}</em>
          </div>
          <div>
            <strong>{formatDecisionMoney(data.expectedClose)}</strong>
            <em>Expected close</em>
          </div>
        </div>
      </div>

      <svg
        className="rp-intel-chart rp-intel-chart-light"
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={`Actual revenue ${formatDecisionMoney(data.revenue)} versus forecast ${formatDecisionMoney(data.forecastAtNow)}`}
      >
        <path
          d={forecastPath}
          fill="none"
          stroke="rgba(10,13,11,0.28)"
          strokeWidth="1.4"
          strokeDasharray="4 4"
        />
        <path
          d={actualPath}
          fill="none"
          stroke="#0a0d0b"
          strokeWidth="1.9"
        />
        {nowPt ? (
          <>
            <line
              x1={nowPt.x}
              y1={pad}
              x2={nowPt.x}
              y2={h - pad}
              stroke="rgba(0,217,120,0.35)"
              strokeWidth="1"
            />
            <circle cx={nowPt.x} cy={nowPt.yA} r={4} fill="#00d978" />
            <text
              x={nowPt.x}
              y={nowPt.yA - 10}
              textAnchor="middle"
              fill="#00a85a"
              fontSize="10"
              fontFamily="Instrument Sans, system-ui, sans-serif"
              fontWeight="560"
            >
              NOW
            </text>
          </>
        ) : null}
        {pts.map((p) => (
          <text
            key={p.s.label}
            x={p.x}
            y={h - 4}
            textAnchor="middle"
            fill="rgba(10,13,11,0.45)"
            fontSize="9"
            fontFamily="Instrument Sans, system-ui, sans-serif"
          >
            {p.s.label}
          </text>
        ))}
      </svg>

      <dl className="rp-intel-stats">
        <div>
          <dt>Covers</dt>
          <dd>
            {data.covers} / {data.coversForecast}
          </dd>
        </div>
        <div>
          <dt>Average spend</dt>
          <dd>
            €{data.avgSpend} vs €{data.avgSpendForecast}
          </dd>
        </div>
        <div>
          <dt>Kitchen</dt>
          <dd>{data.kitchenPressure}%</dd>
        </div>
        <div>
          <dt>Daily target</dt>
          <dd>€26,100</dd>
        </div>
      </dl>

      <RadrRead
        text={data.radrRead}
        judgment={data.judgment}
        decisionId={data.relatedDecisionId}
        state={data.judgment === "WATCHING" ? "WATCHING" : data.judgment}
      />
    </ModuleShell>
  );
}

export function TopDishesModule({
  data,
  def,
}: {
  data: TopDishesReport;
  def: IntelModuleDef;
}) {
  if (!data.available) {
    return (
      <ModuleShell def={def}>
        <p className="rp-intel-empty">{data.radrRead}</p>
        <Link href="/app/connections" className="rp-intel-dec-link">
          {data.needsDataLabel ?? "View Connections →"}
        </Link>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell def={def} period={data.periodLabel}>
      <p className="rp-intel-compare-type">Vs previous comparable service</p>
      <ul className="rp-intel-dishes">
        {data.rows.slice(0, 4).map((d, i) => (
          <li key={d.itemId}>
            <em className="rp-intel-dish-rank" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </em>
            <div className="rp-intel-dish-img">
              {d.imageSrc ? (
                <Image
                  src={d.imageSrc}
                  alt=""
                  width={64}
                  height={64}
                  className="rp-intel-dish-photo"
                  loading="lazy"
                />
              ) : (
                <span className="rp-intel-dish-fallback" aria-hidden="true">
                  {d.name.slice(0, 1)}
                </span>
              )}
            </div>
            <div className="rp-intel-dish-copy">
              <strong>{d.name}</strong>
              <span>
                {d.units} sold · {formatDecisionMoney(d.revenue)} ·{" "}
                {formatDecisionMoney(d.contribution)} contrib.
              </span>
              <em>
                {d.vsComparablePct >= 0 ? "+" : ""}
                {d.vsComparablePct}% vs comparable Friday
              </em>
            </div>
          </li>
        ))}
      </ul>
      <RadrRead
        text={data.radrRead}
        judgment={data.judgment}
        decisionId={data.relatedDecisionId}
      />
    </ModuleShell>
  );
}

export function SettlementBridgeModule({
  data,
  def,
}: {
  data: SettlementBridgeReport;
  def: IntelModuleDef;
}) {
  const W = 520;
  const H = 168;
  const padX = 24;
  const padY = 28;
  const barW = 48;
  const nBars = 7;
  const gap = (W - padX * 2 - barW * nBars) / Math.max(nBars - 1, 1);

  const allY = [
    data.posExpected,
    data.expectedSettlement,
    data.received,
    data.posExpected - data.fees,
    data.posExpected - data.fees - data.refunds,
  ];
  const minY = Math.min(...allY) * 0.96;
  const maxY = Math.max(...allY) * 1.02;
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
  };
  const bars: Bar[] = [];

  bars.push({
    id: "pos",
    label: "POS",
    x: padX,
    y: scale(data.posExpected),
    h: H - padY - scale(data.posExpected),
    kind: "base",
    formatted: formatDecisionMoney(data.posExpected),
  });

  let level = data.posExpected;
  (
    [
      ["fees", -data.fees],
      ["refunds", -data.refunds],
      ["timing", -data.timing],
    ] as const
  ).forEach(([key, delta], i) => {
    const prev = level;
    level += delta;
    const yTop = scale(Math.max(prev, level));
    const yBot = scale(Math.min(prev, level));
    bars.push({
      id: key,
      label: key[0]!.toUpperCase() + key.slice(1),
      x: padX + (barW + gap) * (i + 1),
      y: yTop,
      h: Math.max(yBot - yTop, 3),
      kind: "neg",
      formatted: `−${formatDecisionMoney(Math.abs(delta))}`,
    });
  });

  bars.push({
    id: "expected",
    label: "Expected",
    x: padX + (barW + gap) * 4,
    y: scale(data.expectedSettlement),
    h: H - padY - scale(data.expectedSettlement),
    kind: "result",
    formatted: formatDecisionMoney(data.expectedSettlement),
  });

  bars.push({
    id: "received",
    label: "Received",
    x: padX + (barW + gap) * 5,
    y: scale(data.received),
    h: H - padY - scale(data.received),
    kind: "result",
    formatted: formatDecisionMoney(data.received),
  });

  const gapPrev = data.expectedSettlement;
  const gapNext = data.received;
  const yHi = scale(Math.max(gapPrev, gapNext));
  const yLo = scale(Math.min(gapPrev, gapNext));
  bars.push({
    id: "gap",
    label: "Unexplained",
    x: padX + (barW + gap) * 6,
    y: yHi,
    h: Math.max(yLo - yHi, 3),
    kind: "alert",
    formatted: formatDecisionMoney(data.unexplained),
  });

  return (
    <ModuleShell def={def} period="MTD">
      <p className="rp-intel-compare-type">Vs expected settlement</p>
      <div
        className="rp-intel-waterfall rp-intel-waterfall-svg"
        role="img"
        aria-label="Settlement reconciliation bridge"
      >
        <svg
          className="rp-settle-wf"
          viewBox={`0 0 ${W} ${H + 36}`}
          aria-hidden="true"
        >
          {bars.map((b) => (
            <g key={b.id} className="rp-settle-wf-g" data-kind={b.kind}>
              <rect
                x={b.x}
                y={b.y}
                width={barW}
                height={b.h}
                rx={3}
                className={`rp-settle-bar rp-settle-${b.kind}`}
              />
              <text
                x={b.x + barW / 2}
                y={H + 14}
                textAnchor="middle"
                className="rp-settle-label"
              >
                {b.label}
              </text>
              <text
                x={b.x + barW / 2}
                y={b.y - 5}
                textAnchor="middle"
                className="rp-settle-val"
              >
                {b.formatted.replace("€", "")}
              </text>
            </g>
          ))}
        </svg>
        <p className="rp-settle-gap-callout">
          Unexplained gap ·{" "}
          <strong>{formatDecisionMoney(data.unexplained)}</strong>
        </p>
      </div>
      <RadrRead
        text={data.radrRead}
        judgment={data.judgment}
        decisionId={data.relatedDecisionId}
        state="DECISION_FORMED"
      />
    </ModuleShell>
  );
}

export function SupplierVarianceModule({
  data,
  def,
}: {
  data: SupplierVarianceSummary;
  def: IntelModuleDef;
}) {
  return (
    <ModuleShell def={def} period="MTD">
      <p className="rp-intel-compare-type">VS CONTRACT</p>
      <dl className="rp-intel-stats">
        <div>
          <dt>Invoice</dt>
          <dd>€{data.invoiceRate.toFixed(2)}/L</dd>
        </div>
        <div>
          <dt>Contract</dt>
          <dd>€{data.contractRate.toFixed(2)}/L</dd>
        </div>
        <div>
          <dt>Volume</dt>
          <dd>{data.liters} L</dd>
        </div>
        <div>
          <dt>Exposed</dt>
          <dd>{formatDecisionMoney(data.exposedEuro)}</dd>
        </div>
      </dl>
      <RadrRead
        text={data.radrRead}
        judgment={data.judgment}
        decisionId={data.relatedDecisionId}
        state="DECISION_FORMED"
      />
    </ModuleShell>
  );
}

export function MenuContributionModule({
  data,
  def,
}: {
  data: MenuContributionReport;
  def: IntelModuleDef;
}) {
  const maxU = Math.max(...data.points.map((p) => p.units), 1);
  const maxC = Math.max(...data.points.map((p) => p.contribution), 1);
  const maxR = Math.max(...data.points.map((p) => p.revenue), 1);
  const w = 420;
  const h = 200;
  const pad = 28;

  return (
    <ModuleShell def={def} period="Tonight">
      <p className="rp-intel-compare-type">CONTRIBUTION × POPULARITY</p>
      <svg
        className="rp-intel-chart"
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label="Contribution versus popularity matrix"
      >
        <line
          x1={pad}
          y1={h - pad}
          x2={w - 12}
          y2={h - pad}
          stroke="rgba(10,13,11,0.15)"
        />
        <line
          x1={pad}
          y1={12}
          x2={pad}
          y2={h - pad}
          stroke="rgba(10,13,11,0.15)"
        />
        <text x={w / 2} y={h - 6} textAnchor="middle" fontSize="9" fill="#556059">
          Popularity / units
        </text>
        <text
          x={10}
          y={h / 2}
          textAnchor="middle"
          fontSize="9"
          fill="#556059"
          transform={`rotate(-90 10 ${h / 2})`}
        >
          Contribution
        </text>
        {data.points.map((p) => {
          const x = pad + (p.units / maxU) * (w - pad - 24);
          const y = h - pad - (p.contribution / maxC) * (h - pad - 24);
          const r = 4 + (p.revenue / maxR) * 6;
          return (
            <g key={p.itemId}>
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={p.outlier ? "#0a0d0b" : "rgba(10,13,11,0.32)"}
              />
              {p.outlier ? (
                <text
                  x={x + 10}
                  y={y + 3}
                  fontSize="8"
                  fill="#0a0d0b"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {p.name.split(" ")[0]}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <RadrRead
        text={data.radrRead}
        judgment={data.judgment}
        decisionId={data.relatedDecisionId}
      />
    </ModuleShell>
  );
}
