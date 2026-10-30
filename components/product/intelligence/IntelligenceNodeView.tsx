"use client";

/**
 * Shared Intelligence node body — drawer + Focus Mode.
 * Visual decomposition · clickable drivers · options · no prose-only depth.
 */

import Link from "next/link";
import {
  Metric,
  MetricDeltaText,
  MetricLabel,
  MetricRow,
  MetricStatus,
  MetricValue,
} from "@/components/product/ui/MetricBlock";
import {
  breadcrumbForNode,
  formatIntelMoney,
  type IntelligenceNode,
  type IntelSlice,
} from "@/lib/radr/intelligence/graph";

type Props = {
  node: IntelligenceNode;
  onNavigate: (nodeId: string) => void;
  onOpenDecision?: (id: string) => void;
  /** "drawer" | "focus" — denser chrome in focus */
  surface?: "drawer" | "focus";
  showEvidence?: boolean;
};

function SliceList({
  title,
  slices,
  onNavigate,
}: {
  title: string;
  slices: IntelSlice[];
  onNavigate: (id: string) => void;
}) {
  if (!slices.length) return null;
  const max = Math.max(...slices.map((s) => Math.abs(s.amountEuro)), 1);
  return (
    <section className="rp-inode-sec">
      <p className="rp-inode-k">{title}</p>
      <ul className="rp-inode-slices">
        {slices.map((s) => {
          const pct = Math.max(8, Math.round((Math.abs(s.amountEuro) / max) * 100));
          const tone = s.amountEuro < 0 ? "neg" : s.amountEuro > 0 ? "pos" : undefined;
          return (
            <li key={s.id}>
              <MetricRow
                label={s.label}
                tone={tone}
                value={formatIntelMoney(s.amountEuro)}
                track={<i style={{ width: `${pct}%` }} />}
                onClick={
                  s.childNodeId ? () => onNavigate(s.childNodeId!) : undefined
                }
              />
              {s.note ? <p className="rp-inode-note">{s.note}</p> : null}
              {s.sharePct != null ? (
                <span className="rp-inode-share">{s.sharePct}%</span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function WhenSpark({
  series,
}: {
  series: IntelligenceNode["whenSeries"];
}) {
  if (series.length < 2) return null;
  const pts = series
    .map((p, i) => {
      const x = 4 + (i / (series.length - 1)) * 92;
      const y = 36 - (p.index / 100) * 28;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <section className="rp-inode-sec">
      <p className="rp-inode-k">When</p>
      <svg
        className="rp-inode-spark"
        viewBox="0 0 100 40"
        role="img"
        aria-label="Indexed trajectory"
      >
        <polyline points={pts} fill="none" strokeWidth="1.6" />
        {series.map((p, i) => {
          const x = 4 + (i / (series.length - 1)) * 92;
          return (
            <text key={p.label} x={x} y="38" textAnchor="middle">
              {p.label}
            </text>
          );
        })}
      </svg>
    </section>
  );
}

export function IntelligenceNodeView({
  node,
  onNavigate,
  onOpenDecision,
  surface = "drawer",
  showEvidence = false,
}: Props) {
  const crumbs = breadcrumbForNode(node.id);
  const levers = node.levers.filter((l) => !l.dominated);
  const bridge =
    node.bridge.length > 0
      ? node.bridge
      : [];

  return (
    <div className="rp-inode" data-surface={surface} data-kind={node.kind}>
      <nav className="rp-inode-crumb" aria-label="Intelligence path">
        {crumbs.map((c, i) => (
          <span key={c.id}>
            {i > 0 ? <span className="rp-inode-crumb-sep">›</span> : null}
            {i < crumbs.length - 1 ? (
              <button type="button" onClick={() => onNavigate(c.id)}>
                {c.title}
              </button>
            ) : (
              <em>{c.title}</em>
            )}
          </span>
        ))}
      </nav>

      <Metric tone={node.comparisonFormatted.includes("−") ? "neg" : "ok"}>
        <MetricLabel>{node.title}</MetricLabel>
        <MetricValue className="rp-inode-hero-val">
          {node.primaryFormatted}
        </MetricValue>
        <MetricDeltaText
          tone={node.comparisonFormatted.includes("−") ? "neg" : "pos"}
        >
          {node.comparisonFormatted}
        </MetricDeltaText>
        <MetricStatus>
          Materiality {node.materiality} · {node.actionState}
        </MetricStatus>
      </Metric>

      {node.dataHealth !== "ok" && node.dataHealthNote ? (
        <p className="rp-inode-health" data-state={node.dataHealth}>
          {node.dataHealthNote}
        </p>
      ) : null}

      {bridge.length > 0 ? (
        <section className="rp-inode-sec">
          <p className="rp-inode-k">
            Situation
            {node.explainedPct != null
              ? ` · ${node.explainedPct}% explained`
              : ""}
          </p>
          <ul className="rp-inode-slices">
            {bridge.map((s) => {
              const max = Math.max(
                ...bridge.map((x) => Math.abs(x.amountEuro)),
                1,
              );
              const pct = Math.max(
                8,
                Math.round((Math.abs(s.amountEuro) / max) * 100),
              );
              return (
                <li key={s.id}>
                  <MetricRow
                    label={s.label}
                    tone={
                      s.amountEuro < 0
                        ? "neg"
                        : s.amountEuro > 0
                          ? "pos"
                          : undefined
                    }
                    value={formatIntelMoney(s.amountEuro)}
                    track={<i style={{ width: `${pct}%` }} />}
                    onClick={
                      s.childNodeId
                        ? () => onNavigate(s.childNodeId!)
                        : undefined
                    }
                  />
                  {s.note ? <p className="rp-inode-note">{s.note}</p> : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <SliceList title="Where" slices={node.where} onNavigate={onNavigate} />
      <SliceList title="What" slices={node.what} onNavigate={onNavigate} />
      <WhenSpark series={node.whenSeries} />

      {node.causalSpine.length > 0 ? (
        <section className="rp-inode-sec">
          <p className="rp-inode-k">Causal spine</p>
          <ol className="rp-inode-spine">
            {node.causalSpine.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="rp-inode-sec">
        <p className="rp-inode-k">So what?</p>
        <dl className="rp-inode-sowhat">
          <div>
            <dt>30D</dt>
            <dd>{node.soWhat.exposure30d}</dd>
          </div>
          <div>
            <dt>90D</dt>
            <dd>{node.soWhat.exposure90d}</dd>
          </div>
          <div>
            <dt>Annualized</dt>
            <dd>{node.soWhat.annualized}</dd>
          </div>
          {node.soWhat.affectedLocations != null ? (
            <div>
              <dt>Locations</dt>
              <dd>{node.soWhat.affectedLocations}</dd>
            </div>
          ) : null}
          {node.soWhat.affectedDishes != null ? (
            <div>
              <dt>Dishes</dt>
              <dd>{node.soWhat.affectedDishes}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="rp-inode-sec">
        <p className="rp-inode-k">Options · no-action baseline</p>
        <p className="rp-inode-body">{node.noActionBaseline}</p>
        <ul className="rp-inode-levers">
          {levers.map((l) => (
            <li
              key={l.id}
              data-rec={l.recommended ? "true" : undefined}
              data-baseline={l.isNoAction ? "true" : undefined}
            >
              <div>
                <strong>{l.label}</strong>
                {l.recommended ? <em>RADR</em> : null}
                <span>
                  Guest {l.guestImpact} · {l.confidence} confidence
                </span>
              </div>
              <b data-tone={l.expectedEuro < 0 ? "neg" : "pos"}>
                {formatIntelMoney(l.expectedEuro)}
              </b>
            </li>
          ))}
        </ul>
      </section>

      {(showEvidence || node.kind === "vendor") && node.evidence.length > 0 ? (
        <section className="rp-inode-sec">
          <p className="rp-inode-k">Evidence</p>
          <ul className="rp-inode-evidence">
            {node.evidence.map((e) => (
              <li key={e.id}>
                <span>{e.label}</span>
                <strong>{e.value}</strong>
                <em>
                  {e.source} · {e.freshness}
                </em>
              </li>
            ))}
          </ul>
          <p className="rp-inode-note">Confidence · {node.confidence}</p>
        </section>
      ) : null}

      <footer className="rp-inode-foot">
        {node.relatedDecisions.length > 0 ? (
          <div className="rp-inode-cta-row">
            {node.relatedDecisions.slice(0, 2).map((d) =>
              onOpenDecision ? (
                <button
                  key={d.id}
                  type="button"
                  className="rp-inode-cta"
                  onClick={() => onOpenDecision(d.id)}
                >
                  Review {d.displayId}
                </button>
              ) : (
                <Link
                  key={d.id}
                  href={`/app/decisions/${d.id}`}
                  className="rp-inode-cta"
                >
                  Review {d.displayId}
                </Link>
              ),
            )}
          </div>
        ) : node.levers.some((l) => l.isNoAction && l.recommended) ? (
          <p className="rp-inode-quiet">{node.noActionBaseline}</p>
        ) : (
          <Link href="/app/decisions" className="rp-inode-cta">
            Open Decisions
          </Link>
        )}
      </footer>
    </div>
  );
}
