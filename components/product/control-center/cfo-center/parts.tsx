"use client";

import Link from "next/link";
import type {
  AttentionItem,
  BridgeStep,
  CausalDriverChip,
  ConcentrationSlice,
  DriverId,
  KpiMetric,
  OutlookScenarioMetric,
  PendingDecision,
  PortfolioAction,
  PortfolioRow,
  PortfolioState,
  SinceLastCheckItem,
  SparkTone,
  VerifiedItem,
} from "@/lib/product/cfoControlCenter/types";
import { composeHeroBody } from "@/lib/product/cfoControlCenter";

export function Sparkline({
  values,
  tone = "pos",
  kind = "line",
}: {
  values: number[];
  tone?: SparkTone;
  kind?: "line" | "bars";
}) {
  const w = 72;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (w - 2) + 1;
      const y = h - 3 - ((v - min) / span) * (h - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke =
    tone === "neg" ? "var(--cfo-coral)" : tone === "pos" ? "var(--cfo-green)" : "var(--cfo-muted)";

  if (kind === "bars") {
    const bw = (w - 4) / values.length - 2;
    return (
      <svg className="cfo-spark" viewBox={`0 0 ${w} ${h}`} aria-hidden>
        {values.map((v, i) => {
          const bh = ((v - min) / span) * (h - 6) + 4;
          const x = 2 + i * ((w - 4) / values.length);
          return (
            <rect
              key={i}
              x={x}
              y={h - bh - 1}
              width={Math.max(bw, 3)}
              height={bh}
              rx="1.5"
              fill={stroke}
              opacity={0.55 + (i / values.length) * 0.45}
            />
          );
        })}
      </svg>
    );
  }

  return (
    <svg className="cfo-spark" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StateBadge({ state }: { state: PortfolioState }) {
  const label =
    state === "intervene" ? "Intervene" : state === "watch" ? "Watch" : "Healthy";
  return <span className={`cfo-state cfo-state-${state}`}>{label}</span>;
}

export function SinceLastCheck({
  items,
  onSelect,
}: {
  items: SinceLastCheckItem[];
  onSelect: (item: SinceLastCheckItem) => void;
}) {
  return (
    <div className="cfo-since" aria-label="Since your last check">
      <span className="cfo-since-label">Since your last check</span>
      <ul className="cfo-since-list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={item.tone ? `cfo-tone-${item.tone}` : undefined}
              onClick={() => onSelect(item)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExposureModel({
  model,
  forecast,
}: {
  model: {
    gross: string;
    covered: string;
    coveredPct: number;
    unmanaged: string;
    unmanagedPct: number;
  };
  forecast: {
    confidencePct: number;
    sourcesHealthy: string;
    reason?: string;
    href: string;
  };
}) {
  return (
    <section className="cfo-exposure-model" aria-label="Canonical exposure model">
      <div className="cfo-exposure-grid">
        <div className="cfo-exposure-cell">
          <span className="cfo-kpi-label">Gross exposure</span>
          <strong>{model.gross}</strong>
        </div>
        <div className="cfo-exposure-cell">
          <span className="cfo-kpi-label">Decision-covered</span>
          <strong className="cfo-tone-pos">{model.covered}</strong>
          <em>{model.coveredPct}%</em>
        </div>
        <div className="cfo-exposure-cell">
          <span className="cfo-kpi-label">Unmanaged</span>
          <strong className="cfo-tone-neg">{model.unmanaged}</strong>
          <em className="cfo-tone-neg">{model.unmanagedPct}%</em>
        </div>
      </div>
      <Link href={forecast.href} className="cfo-trust-chip" title={forecast.reason || undefined}>
        <strong>{forecast.confidencePct}%</strong>
        <span>confidence</span>
        <span className="cfo-trust-src">{forecast.sourcesHealthy}</span>
        {forecast.reason ? <span className="cfo-forecast-why">{forecast.reason}</span> : null}
      </Link>
    </section>
  );
}

export function DecisionPosture({
  posture,
}: {
  posture: {
    needsYouCount: number;
    expectedValue: string;
    unmanaged: string;
    confidencePct: number;
  };
}) {
  return (
    <div className="cfo-posture" aria-label="Decision posture">
      <span>
        <strong>{posture.needsYouCount}</strong> Decisions need you
      </span>
      <span className="cfo-tone-pos">{posture.expectedValue} expected value</span>
      <span className="cfo-tone-neg">{posture.unmanaged} unmanaged exposure</span>
      <span>{posture.confidencePct}% forecast confidence</span>
    </div>
  );
}

export function KpiStrip({ metrics }: { metrics: KpiMetric[] }) {
  return (
    <section className="cfo-kpi-strip" aria-label="Group performance">
      {metrics.map((m) => (
        <article key={m.id} className="cfo-kpi" data-tone={m.deltaTone}>
          <div className="cfo-kpi-top">
            <span className="cfo-kpi-label">{m.label}</span>
            <Sparkline values={m.spark} tone={m.deltaTone} />
          </div>
          <div className="cfo-kpi-value">{m.value}</div>
          <div className={`cfo-kpi-delta cfo-tone-${m.deltaTone}`}>
            <span className="cfo-kpi-arrow" aria-hidden>
              {m.delta.startsWith("−") || m.delta.startsWith("-") ? "↓" : "↑"}
            </span>
            {m.delta}
          </div>
        </article>
      ))}
    </section>
  );
}

function ConcentrationBars({
  slices,
  onSelect,
  activeId,
}: {
  slices: ConcentrationSlice[];
  onSelect?: (locationId: string | null) => void;
  activeId?: string | null;
}) {
  return (
    <ul className="cfo-conc">
      {slices.map((s) => {
        const loc = s.locationIds?.[0] ?? null;
        const active = loc && activeId === loc;
        return (
          <li key={s.id}>
            <button
              type="button"
              className={active ? "is-active" : undefined}
              onClick={() => onSelect?.(loc)}
              disabled={!loc}
            >
              <span className="cfo-conc-name">{s.name}</span>
              <span className="cfo-conc-track">
                <i style={{ width: `${s.pct}%` }} />
              </span>
              <span className="cfo-conc-pct">{s.pct}%</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function RadrSeesHero({
  hero,
  onFocusLocation,
  onSelectDriver,
  activeLocationId,
  selectedDriverId,
}: {
  hero: {
    eyebrow: string;
    headline: string;
    focusEntities: string[];
    gapAmount: string;
    gapNoun: string;
    drivers: string[];
    radrStatus: string;
    cta: string;
    ctaHref: string;
    opportunity: string;
    concentration: ConcentrationSlice[];
    causalDrivers: CausalDriverChip[];
    gapShareLabel: string;
    image: string;
    imageAlt: string;
  };
  onFocusLocation?: (id: string | null) => void;
  onSelectDriver?: (id: DriverId | null) => void;
  activeLocationId?: string | null;
  selectedDriverId?: DriverId | null;
}) {
  return (
    <section className="cfo-hero cfo-hero-intel" aria-label={hero.eyebrow}>
      <div
        className="cfo-hero-texture"
        style={{ backgroundImage: `url(${hero.image})` }}
        aria-hidden
      />
      <div className="cfo-hero-copy">
        <div className="cfo-hero-eyebrow">
          <span className="cfo-hero-badge">RADR Sees</span>
        </div>
        <h2 className="cfo-hero-headline">{hero.headline}</h2>
        <p className="cfo-hero-body">{composeHeroBody(hero)}</p>
        <div className="cfo-hero-causal" aria-label="Primary drivers">
          {hero.causalDrivers.map((d) => (
            <button
              key={d.driverId}
              type="button"
              className={selectedDriverId === d.driverId ? "is-active" : undefined}
              onClick={() =>
                onSelectDriver?.(
                  selectedDriverId === d.driverId ? null : d.driverId,
                )
              }
            >
              {d.label}
            </button>
          ))}
          <em>→</em>
          <strong>{hero.gapShareLabel}</strong>
        </div>
        <ConcentrationBars
          slices={hero.concentration}
          onSelect={onFocusLocation}
          activeId={activeLocationId}
        />
        <div className="cfo-hero-actions">
          <Link href={hero.ctaHref} className="cfo-hero-cta">
            {hero.cta} <span aria-hidden>→</span>
          </Link>
          <span className="cfo-hero-chip">{hero.opportunity}</span>
        </div>
      </div>
    </section>
  );
}

function bridgeLayout(steps: BridgeStep[]) {
  const bases: number[] = [];
  const highs: number[] = [];
  let running = 0;
  for (const s of steps) {
    if (s.kind === "start" || s.kind === "end") {
      running = s.value;
      bases.push(0);
      highs.push(s.value);
    } else {
      const next = running + s.value;
      bases.push(Math.min(running, next));
      highs.push(Math.max(running, next, Math.abs(s.value)));
      running = next;
    }
  }
  return { bases, peak: Math.max(...highs, 1) };
}

export function BridgeChart({
  title,
  subtitle,
  steps,
  planLabel,
  actualLabel,
  mode,
  onModeChange,
  selectedDriverId,
  onSelectDriver,
  hoverLocationId,
}: {
  title: string;
  subtitle: string;
  steps: BridgeStep[];
  planLabel: string;
  actualLabel: string;
  mode: "value" | "pct";
  onModeChange: (m: "value" | "pct") => void;
  selectedDriverId: DriverId | null;
  onSelectDriver: (id: DriverId | null) => void;
  hoverLocationId?: string | null;
}) {
  const { bases, peak } = bridgeLayout(steps);
  const plan = steps[0]?.value || 1;
  const chartH = 210;
  const selected = steps.find((s) => s.driverId && s.driverId === selectedDriverId);

  const fmtBridge = (n: number, signed: boolean) => {
    const abs = Math.abs(n);
    const body =
      abs >= 1000 ? `${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k` : String(abs);
    if (!signed) return body.replace(/\.0k$/, "k");
    const sign = n > 0 ? "+" : n < 0 ? "−" : "";
    return `${sign}${body.replace(/\.0k$/, "k")}`;
  };

  return (
    <section className="cfo-bridge" aria-label={title} data-has-selection={selected ? "true" : undefined}>
      <header className="cfo-bridge-head">
        <div>
          <h2 className="cfo-section-title">{title}</h2>
          <p className="cfo-section-sub">{subtitle}</p>
        </div>
        <div className="cfo-bridge-toggle" role="group" aria-label="Bridge unit">
          <button
            type="button"
            className={mode === "value" ? "is-active" : undefined}
            onClick={() => onModeChange("value")}
          >
            € Value
          </button>
          <button
            type="button"
            className={mode === "pct" ? "is-active" : undefined}
            onClick={() => onModeChange("pct")}
          >
            % Impact
          </button>
        </div>
      </header>
      <div className="cfo-bridge-summary">
        <span>{planLabel}</span>
        <span aria-hidden>→</span>
        <span>{actualLabel}</span>
      </div>
      <div className="cfo-bridge-plot">
        {steps.map((s, i) => {
          const isAnchor = s.kind === "start" || s.kind === "end";
          const magnitude = isAnchor ? s.value : Math.abs(s.value);
          const barH = Math.max((magnitude / peak) * chartH, isAnchor ? 12 : 10);
          const bottom = isAnchor ? 0 : (bases[i]! / peak) * chartH;
          const label =
            mode === "pct"
              ? `${s.value >= 0 ? "+" : "−"}${Math.abs((s.value / plan) * 100).toFixed(0)}%`
              : isAnchor
                ? fmtBridge(s.value, false)
                : fmtBridge(s.value, true);
          const interactive = Boolean(s.driverId);
          const isSelected = s.driverId && s.driverId === selectedDriverId;
          const locHit =
            hoverLocationId &&
            s.breakdown?.some((b) => b.locationId === hoverLocationId);
          const gapShare = `${Math.abs((s.value / plan) * 100).toFixed(0)}% of plan move`;
          const topLocs = (s.breakdown || [])
            .slice(0, 3)
            .map((b) => `${b.name} ${b.amountLabel}`)
            .join(" · ");

          const inner = (
            <>
              <div className="cfo-bridge-val" data-kind={s.kind}>
                {label}
              </div>
              <div className="cfo-bridge-track" style={{ height: chartH }}>
                {i < steps.length - 1 ? <span className="cfo-bridge-connector" /> : null}
                <div
                  className={`cfo-bridge-bar cfo-bridge-bar-${s.kind}`}
                  style={{ height: barH, bottom }}
                />
              </div>
              <div className="cfo-bridge-label">{s.shortLabel || s.label}</div>
              {interactive ? (
                <div className="cfo-bridge-tip" role="tooltip">
                  <strong>
                    {s.shortLabel || s.label} {fmtBridge(s.value, true)}
                  </strong>
                  <span>{gapShare}</span>
                  {topLocs ? <span>{topLocs}</span> : null}
                  {s.decisionsAddressed ? (
                    <span>
                      {s.decisionsAddressed.count} active RADR Decisions address{" "}
                      {s.decisionsAddressed.valueLabel}.
                    </span>
                  ) : null}
                </div>
              ) : null}
            </>
          );

          if (!interactive) {
            return (
              <div key={s.id} className="cfo-bridge-col" data-kind={s.kind}>
                {inner}
              </div>
            );
          }

          return (
            <button
              key={s.id}
              type="button"
              className="cfo-bridge-col cfo-bridge-col-btn"
              data-kind={s.kind}
              data-selected={isSelected ? "true" : undefined}
              data-loc-hit={locHit ? "true" : undefined}
              onClick={() =>
                onSelectDriver(isSelected ? null : (s.driverId as DriverId))
              }
            >
              {inner}
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="cfo-bridge-panel" role="region" aria-label={`${selected.label} breakdown`}>
          <header>
            <h3>
              {selected.label}{" "}
              <em className={selected.value < 0 ? "cfo-tone-neg" : "cfo-tone-pos"}>
                {fmtBridge(selected.value, true)}
              </em>
            </h3>
            <button type="button" onClick={() => onSelectDriver(null)}>
              Clear
            </button>
          </header>
          <ul>
            {(selected.breakdown || []).map((row) => (
              <li
                key={row.locationId}
                data-active={hoverLocationId === row.locationId ? "true" : undefined}
              >
                <span>{row.name}</span>
                <strong>{row.amountLabel}</strong>
              </li>
            ))}
          </ul>
          {selected.decisionsAddressed ? (
            <p className="cfo-bridge-panel-note">
              {selected.decisionsAddressed.count} RADR Decisions address{" "}
              {selected.decisionsAddressed.valueLabel} of this variance.{" "}
              <Link href="/app/intelligence">Open Intelligence →</Link>
            </p>
          ) : null}
        </div>
      ) : (
        <p className="cfo-bridge-hint">Select a driver to see location breakdown and linked Decisions.</p>
      )}
    </section>
  );
}

export function ForwardOutlook({
  title,
  current,
  withRadr,
  protectedLabel,
  scenario,
  onScenarioChange,
}: {
  title: string;
  current: OutlookScenarioMetric[];
  withRadr: OutlookScenarioMetric[];
  protectedLabel: string;
  scenario: "current" | "radr";
  onScenarioChange: (s: "current" | "radr") => void;
}) {
  const metrics = scenario === "current" ? current : withRadr;
  return (
    <section className="cfo-outlook" aria-label={title}>
      <header className="cfo-outlook-head">
        <h2 className="cfo-section-title">{title}</h2>
        <div className="cfo-scenario-toggle" role="group" aria-label="Outlook scenario">
          <button
            type="button"
            className={scenario === "current" ? "is-active" : undefined}
            onClick={() => onScenarioChange("current")}
          >
            Current course
          </button>
          <button
            type="button"
            className={scenario === "radr" ? "is-active" : undefined}
            onClick={() => onScenarioChange("radr")}
          >
            With RADR
          </button>
        </div>
      </header>
      <div className="cfo-outlook-grid" data-scenario={scenario} key={scenario}>
        {metrics.map((m) => (
          <article key={m.id} className="cfo-outlook-card" data-tone={m.tone || "neutral"}>
            <span className="cfo-kpi-label">{m.label}</span>
            <div className={`cfo-outlook-value ${m.tone ? `cfo-tone-${m.tone}` : ""}`}>
              {m.value}
            </div>
          </article>
        ))}
        {scenario === "radr" ? (
          <article className="cfo-outlook-card cfo-outlook-protected">
            <span className="cfo-kpi-label">Value protected</span>
            <div className="cfo-outlook-value cfo-tone-pos">{protectedLabel}</div>
          </article>
        ) : null}
      </div>
    </section>
  );
}

function actionLabel(action: PortfolioAction): string {
  switch (action) {
    case "review_decision":
      return "Review Decision";
    case "investigate":
      return "Investigate";
    case "view_live":
      return "View in Live";
    case "view_evidence":
      return "View evidence";
    case "healthy":
      return "Healthy";
    default:
      return "View";
  }
}

export function ActionRail({
  attention,
  pending,
  verified,
  activeDriverId,
  activeLocationId,
  onAttentionFocus,
}: {
  attention: AttentionItem[];
  pending: PendingDecision[];
  verified: VerifiedItem[];
  activeDriverId?: DriverId | null;
  activeLocationId?: string | null;
  onAttentionFocus: (item: AttentionItem) => void;
}) {
  const att = activeDriverId
    ? attention.filter((a) => a.driverId === activeDriverId)
    : attention;
  const attentionDecisionIds = new Set(
    att.map((a) => a.decisionId).filter(Boolean),
  );
  const pend = (activeDriverId
    ? pending.filter((p) => p.driverId === activeDriverId)
    : pending
  ).filter((p) => !attentionDecisionIds.has(p.decisionId));

  return (
    <aside className="cfo-rail" aria-label="Operating workflow">
      <div className="cfo-rail-flow" aria-hidden>
        <span>Needs you</span>
        <em>→</em>
        <span>Pending</span>
        <em>→</em>
        <span>Verified</span>
      </div>

      <section className="cfo-rail-block" data-stage="attention">
        <header className="cfo-rail-head cfo-rail-head-attention">
          <span className="cfo-rail-icon" aria-hidden />
          <h2>Needs Your Attention</h2>
          <span className="cfo-rail-count">{att.length}</span>
        </header>
        <ul className="cfo-rail-list">
          {att.map((item) => {
            const open = activeLocationId === item.locationId;
            return (
              <li key={item.id}>
                <div
                  className="cfo-rail-card cfo-rail-attention"
                  data-active={open ? "true" : undefined}
                  onMouseEnter={() => onAttentionFocus(item)}
                >
                  <Link href={item.href} className="cfo-rail-attention-main">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.thumb} alt="" className="cfo-thumb" />
                    <div className="cfo-rail-body">
                      <div className="cfo-rail-title">{item.title}</div>
                      <div className="cfo-rail-line">{item.problem}</div>
                      <div className="cfo-rail-money cfo-tone-neg">{item.exposure} exposed</div>
                    </div>
                  </Link>
                  <div className="cfo-rail-response">
                    <div className="cfo-rail-response-row">
                      <span>Prepared</span>
                      <strong>{item.recommendation}</strong>
                    </div>
                    <div className="cfo-rail-response-row">
                      <span>Expected</span>
                      <strong className="cfo-tone-pos">{item.expected}</strong>
                    </div>
                    <div className={`cfo-path-green${open ? " is-open" : ""}`}>
                      <div>
                        <span>What is wrong</span>
                        <strong>{item.problem}</strong>
                      </div>
                      <div>
                        <span>Why</span>
                        <strong>{item.driver}</strong>
                      </div>
                      <div>
                        <span>RADR recommendation</span>
                        <strong>{item.recommendation}</strong>
                      </div>
                      <div>
                        <span>Expected outcome</span>
                        <strong className="cfo-tone-pos">{item.expected}</strong>
                      </div>
                      <div>
                        <span>Confidence</span>
                        <strong>{item.confidence}%</strong>
                      </div>
                      <div>
                        <span>Decision needed</span>
                        <strong>{item.deadline}</strong>
                      </div>
                      <Link href={item.href} className="cfo-path-cta">
                        Open Decision →
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="cfo-rail-block" data-stage="pending">
        <header className="cfo-rail-head cfo-rail-head-pending">
          <span className="cfo-rail-icon" aria-hidden />
          <h2>Pending Decisions</h2>
          <span className="cfo-rail-count">{pend.length}</span>
        </header>
        <ul className="cfo-rail-list">
          {pend.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="cfo-rail-card cfo-rail-card-link">
                <div className="cfo-rail-body">
                  <div className="cfo-rail-title">{item.title}</div>
                  <div className="cfo-rail-line">{item.scope}</div>
                  <div className="cfo-rail-meta-row">
                    <span>{item.deadline}</span>
                    <span>{item.confidence}% confidence</span>
                  </div>
                </div>
                <div className="cfo-rail-money-stack">
                  <span className="cfo-rail-meta">Expected</span>
                  <span className="cfo-rail-money cfo-tone-pos">{item.expected}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="cfo-rail-block" data-stage="verified">
        <header className="cfo-rail-head cfo-rail-head-verified">
          <span className="cfo-rail-icon" aria-hidden />
          <h2>Verified Value</h2>
          <span className="cfo-rail-count">{verified.length}</span>
        </header>
        <ul className="cfo-rail-list">
          {verified.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="cfo-rail-card cfo-rail-card-link cfo-rail-verified">
                <div className="cfo-rail-body">
                  <div className="cfo-rail-title">{item.title}</div>
                  <div className="cfo-rail-line">{item.scope}</div>
                  <div className="cfo-rail-verify-detail">
                    <div>
                      Expected: <strong>{item.expected}</strong>
                    </div>
                    <div>
                      Actual: <strong>{item.actual}</strong>
                    </div>
                    <div>
                      Accuracy: <strong>{item.accuracy}</strong>
                    </div>
                    <div>
                      Evidence: <em>verified</em>
                    </div>
                  </div>
                </div>
                <div className="cfo-rail-money cfo-tone-pos">{item.value}</div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

function ChannelBar({
  primary,
  primaryLabel,
  secondaryLabel,
}: {
  primary: number;
  primaryLabel: string;
  secondaryLabel: string;
}) {
  return (
    <div
      className="cfo-channel"
      title={`${primaryLabel} ${primary}% · ${secondaryLabel} ${100 - primary}%`}
    >
      <div className="cfo-channel-track">
        <span style={{ width: `${primary}%` }} />
      </div>
      <div className="cfo-channel-labels">
        <span>
          {primaryLabel} {primary}%
        </span>
      </div>
    </div>
  );
}

export function PortfolioTable({
  title,
  entityLabel,
  columns,
  tabs,
  rows,
  activeTab,
  onTabChange,
  selectedDriverId,
  activeLocationId,
  hoverLocationId,
  onHoverLocation,
  showHealthy,
  onToggleHealthy,
}: {
  title: string;
  entityLabel: string;
  columns: "restaurant" | "hotel";
  tabs: { id: string; label: string; count: number }[];
  rows: PortfolioRow[];
  activeTab: string;
  onTabChange: (id: string) => void;
  selectedDriverId: DriverId | null;
  activeLocationId: string | null;
  hoverLocationId: string | null;
  onHoverLocation: (id: string | null) => void;
  showHealthy: boolean;
  onToggleHealthy: () => void;
}) {
  let working = [...rows];

  if (columns === "hotel" && activeTab !== "all") {
    working = working.filter((r) =>
      r.subtitle?.toLowerCase().includes(activeTab),
    );
  } else if (columns === "restaurant" && activeTab !== "all") {
    working = working.filter((r) => r.state === activeTab);
  }

  if (selectedDriverId) {
    working = working.filter((r) => r.materialDrivers.includes(selectedDriverId));
    working = [...working].sort((a, b) => b.exposurePct - a.exposurePct);
  }

  const healthy = working.filter((r) => r.state === "healthy");
  const material = working.filter((r) => r.state !== "healthy");
  /** Default CFO view: Intervene + Watch; healthy collapsed behind reveal */
  const visible =
    activeTab === "healthy"
      ? healthy
      : activeTab === "intervene" || activeTab === "watch"
        ? working.filter((r) => r.state === activeTab)
        : showHealthy
          ? working
          : material;

  const emphasize =
    selectedDriverId === "labor"
      ? "labor"
      : selectedDriverId === "cogs"
        ? "cogs"
        : selectedDriverId === "channel" || selectedDriverId === "dist"
          ? "channel"
          : selectedDriverId === "occ"
            ? "occupancy"
            : null;

  return (
    <section className="cfo-portfolio" aria-label={title}>
      <header className="cfo-portfolio-head">
        <h2 className="cfo-section-title">{title}</h2>
        <div className="cfo-tabs" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              className={activeTab === t.id ? "is-active" : undefined}
              onClick={() => onTabChange(t.id)}
            >
              {t.label} <em>({t.count})</em>
            </button>
          ))}
        </div>
      </header>
      <div className="cfo-table-wrap">
        <table className="cfo-table" data-emphasize={emphasize || undefined}>
          <thead>
            <tr>
              <th>{entityLabel}</th>
              <th>State</th>
              <th>Revenue</th>
              {columns === "restaurant" ? (
                <>
                  <th>vs Plan</th>
                  <th>Contribution</th>
                  <th>Margin</th>
                  <th data-col="labor">Labor</th>
                  <th data-col="cogs">COGS</th>
                  <th data-col="channel">Channel</th>
                </>
              ) : (
                <>
                  <th data-col="occupancy">Occupancy</th>
                  <th>ADR</th>
                  <th>RevPAR</th>
                  <th>Contribution</th>
                  <th data-col="labor">Labor</th>
                  <th data-col="channel">Channel</th>
                </>
              )}
              <th>Exposure</th>
              <th>Verified</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const driverHit =
                selectedDriverId && row.materialDrivers.includes(selectedDriverId);
              const href =
                row.action === "review_decision" && row.decisionId
                  ? `/app/decisions/${row.decisionId}`
                  : row.action === "view_live"
                    ? row.liveHref
                    : row.liveHref;
              return (
                <tr
                  key={row.id}
                  data-state={row.state}
                  data-active={activeLocationId === row.id ? "true" : undefined}
                  data-driver-hit={driverHit ? "true" : undefined}
                  data-hover={hoverLocationId === row.id ? "true" : undefined}
                  onMouseEnter={() => onHoverLocation(row.id)}
                  onMouseLeave={() => onHoverLocation(null)}
                >
                  <td>
                    <div className="cfo-loc">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={row.thumb} alt="" className="cfo-thumb cfo-thumb-lg" />
                      <div>
                        <div className="cfo-loc-name">{row.name}</div>
                        {row.subtitle ? (
                          <div className="cfo-loc-sub">{row.subtitle}</div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td>
                    <StateBadge state={row.state} />
                  </td>
                  <td className="cfo-num">{row.revenue}</td>
                  {columns === "restaurant" ? (
                    <>
                      <td className={`cfo-num cfo-tone-${row.vsPlanTone || "neutral"}`}>
                        {row.vsPlan}
                      </td>
                      <td className="cfo-num">{row.contribution}</td>
                      <td className="cfo-num">{row.margin}</td>
                      <td className={`cfo-num cfo-tone-${row.laborTone}`} data-col="labor">
                        {row.labor}
                      </td>
                      <td
                        className={`cfo-num cfo-tone-${row.cogsTone || "neutral"}`}
                        data-col="cogs"
                      >
                        {row.cogs}
                      </td>
                      <td data-col="channel">
                        <ChannelBar {...row.channel} />
                      </td>
                    </>
                  ) : (
                    <>
                      <td
                        className={`cfo-num cfo-tone-${row.occupancyTone || "neutral"}`}
                        data-col="occupancy"
                      >
                        {row.occupancy}
                      </td>
                      <td className="cfo-num">{row.adr}</td>
                      <td className="cfo-num">{row.revpar}</td>
                      <td className="cfo-num cfo-tone-pos">{row.gop}</td>
                      <td className={`cfo-num cfo-tone-${row.laborTone}`} data-col="labor">
                        {row.labor}
                      </td>
                      <td data-col="channel">
                        <ChannelBar {...row.channel} />
                      </td>
                    </>
                  )}
                  <td>
                    <div className="cfo-exposure">
                      <span className="cfo-num cfo-tone-neg">{row.exposure}</span>
                      <span className="cfo-exposure-bar">
                        <i style={{ width: `${row.exposurePct}%` }} />
                      </span>
                    </div>
                  </td>
                  <td className="cfo-num cfo-tone-pos">{row.verified}</td>
                  <td>
                    <Link href={href} className="cfo-action" data-action={row.action}>
                      {actionLabel(row.action)}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {(activeTab === "all" || !activeTab) && healthy.length > 0 ? (
        <button type="button" className="cfo-show-healthy" onClick={onToggleHealthy}>
          {showHealthy
            ? "Hide healthy locations"
            : `Show ${healthy.length} healthy`}
        </button>
      ) : null}
    </section>
  );
}
