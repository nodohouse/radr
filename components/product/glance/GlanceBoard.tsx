"use client";

import Link from "next/link";
import type {
  GlanceBrief,
  GlanceContextPanel,
  GlanceSignal,
} from "@/lib/radr/glance";
import { signalKind } from "@/lib/radr/glance";
import { WhyLine } from "@/components/product/WhyLine";

export type GlanceVenueRow = {
  id: string;
  name: string;
  attention: number;
  status: "needs" | "calm";
  statusLabel: string;
  /** Short causal reason this venue is in the compare strip. */
  why: string;
};

type Props = {
  brief: GlanceBrief;
  onAction: (signal: GlanceSignal) => void;
  venues?: GlanceVenueRow[];
  compareHref?: string | null;
  onFocusVenue?: (id: string) => void;
  onBackToCompare?: (() => void) | null;
};

function padRank(n: number) {
  return String(n).padStart(2, "0");
}

function ContextPanel({
  panel,
  onAction,
}: {
  panel: GlanceContextPanel;
  onAction: (signal: GlanceSignal) => void;
}) {
  return (
    <aside className="rp-os-panel" aria-label={panel.title}>
      <p className="rp-os-panel-kicker">{panel.title}</p>

      <div className="rp-os-panel-metrics">
        {panel.metrics.map((m) => (
          <div key={m.label} className="rp-os-panel-metric">
            <span className="rp-os-panel-metric-label">{m.label}</span>
            <strong className="rp-os-panel-metric-value">{m.value}</strong>
            {m.hint ? (
              <span className="rp-os-panel-metric-hint">{m.hint}</span>
            ) : null}
          </div>
        ))}
      </div>

      {panel.sections.map((s) => (
        <div key={s.label} className="rp-os-panel-section">
          <p className="rp-os-panel-section-label">{s.label}</p>
          {s.lines.map((line) => (
            <p key={line} className="rp-os-panel-section-line">
              {line}
            </p>
          ))}
        </div>
      ))}

      {panel.next ? (
        <div className="rp-os-panel-next">
          <p className="rp-os-panel-section-label">Next moment</p>
          <p className="rp-os-panel-next-line">
            <strong>{panel.next.when}</strong>
            {panel.next.label}
          </p>
        </div>
      ) : null}

      {panel.ctaLabel && panel.ctaAction ? (
        <button
          type="button"
          className="rp-os-cta rp-os-cta-ghost"
          onClick={() =>
            onAction({
              id: "context-cta",
              label: panel.title,
              state: panel.ctaLabel!,
              action: panel.ctaAction!,
              actionLabel: panel.ctaLabel,
              tone: "neutral",
            })
          }
        >
          {panel.ctaLabel}
        </button>
      ) : null}
    </aside>
  );
}

/**
 * Command-center Control Center - priority queue + role context panel.
 */
export function GlanceBoard({
  brief,
  onAction,
  venues,
  compareHref,
  onFocusVenue,
  onBackToCompare,
}: Props) {
  const priorities = brief.primary.filter((s) => s.action !== "none");
  const contextPrimary = brief.primary.filter((s) => s.action === "none");
  const showVenues = Boolean(venues && venues.length >= 2);

  return (
    <section
      className="rp-os"
      aria-label="Operating glance"
      data-role={brief.role}
      data-phase={brief.phase}
      data-compare={showVenues ? "true" : undefined}
    >
      <header className="rp-os-hero" data-tour-target="hero">
        <p className="rp-os-kicker">{brief.kicker}</p>
        <h1 className="rp-os-headline">{brief.headline}</h1>
        {brief.meta ? <p className="rp-os-meta">{brief.meta}</p> : null}
      </header>

      {showVenues ? (
        <div className="rp-os-venues" aria-label="Compared venues">
          <div className="rp-os-venues-head">
            <p className="rp-os-venues-kicker">Venues in view</p>
            <div className="rp-os-venues-links">
              {compareHref ? (
                <Link href={compareHref}>Full compare</Link>
              ) : null}
            </div>
          </div>
          <ul className="rp-os-venues-list">
            {venues!.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  className="rp-os-venue"
                  data-status={v.status}
                  onClick={() => onFocusVenue?.(v.id)}
                >
                  <span className="rp-os-venue-name">{v.name}</span>
                  <span className="rp-os-venue-attn">
                    {v.attention === 0
                      ? "Nothing waiting"
                      : `${v.attention} need${v.attention === 1 ? "s" : ""} you`}
                  </span>
                  <span className="rp-os-venue-status">{v.statusLabel}</span>
                  <WhyLine why={v.why} as="span" className="rp-os-venue-why" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : onBackToCompare ? (
        <div className="rp-os-venues rp-os-venues-resume" aria-label="Compare">
          <div className="rp-os-venues-head">
            <p className="rp-os-venues-kicker">Single location</p>
            <div className="rp-os-venues-links">
              <button type="button" onClick={onBackToCompare}>
                Back to compare
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {brief.strip.length > 0 ? (
        <ul className="rp-os-ready" aria-label="Shift readiness">
          {brief.strip.map((s) => (
            <li key={s.id} data-tone={s.tone}>
              <span className="rp-os-ready-label">{s.label}</span>
              <strong className="rp-os-ready-state">{s.state}</strong>
              <WhyLine why={s.why} as="span" />
            </li>
          ))}
        </ul>
      ) : null}

      <div className="rp-os-split">
        <div className="rp-os-main">
          {priorities.length > 0 ? (
            <ol className="rp-os-queue" aria-label="Priority actions">
              {priorities.map((signal, i) => {
                const kind = signalKind(signal);
                return (
                  <li
                    key={signal.id}
                    className="rp-os-item"
                    data-rank={i + 1}
                    data-kind={kind}
                    data-tour-target={
                      signal.id === "bluefin" ? "decision" : undefined
                    }
                  >
                    <div className="rp-os-item-index" aria-hidden="true">
                      {padRank(i + 1)}
                    </div>
                    <div className="rp-os-item-body">
                      <p className="rp-os-item-label">
                        {kind === "safety" ? (
                          <span className="rp-os-safety-mark" aria-hidden="true">
                            ⚠{" "}
                          </span>
                        ) : null}
                        {signal.label}
                      </p>
                      <h2 className="rp-os-item-state">{signal.state}</h2>
                      {kind === "recovery" ? (
                        <>
                          {signal.deadline ? (
                            <p className="rp-os-item-deadline">{signal.deadline}</p>
                          ) : null}
                          {signal.number ? (
                            <p className="rp-os-item-num rp-os-item-at-risk">
                              <strong>{signal.number}</strong>
                              {signal.impact ? (
                                <span>{signal.impact}</span>
                              ) : null}
                            </p>
                          ) : null}
                          <WhyLine why={signal.why ?? signal.context} />
                        </>
                      ) : (
                        <>
                          {signal.impact || signal.number ? (
                            <p className="rp-os-item-num">
                              {signal.number &&
                              signal.impact &&
                              signal.number !== signal.impact ? (
                                <>
                                  <strong>{signal.number}</strong>
                                  <span> · {signal.impact}</span>
                                </>
                              ) : (
                                signal.impact ?? signal.number
                              )}
                            </p>
                          ) : null}
                          <WhyLine why={signal.why ?? signal.context} />
                          {signal.deadline ? (
                            <p className="rp-os-item-deadline">{signal.deadline}</p>
                          ) : null}
                        </>
                      )}
                      {signal.actionLabel ? (
                        <button
                          type="button"
                          className={
                            kind === "safety"
                              ? "rp-os-cta rp-os-cta-safety"
                              : kind === "recovery"
                                ? "rp-os-cta rp-os-cta-recovery"
                                : "rp-os-cta"
                          }
                          onClick={() => onAction(signal)}
                        >
                          {signal.actionLabel}
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : null}

          {contextPrimary.length > 0 ? (
            <div className="rp-os-context-row" aria-label="Context">
              {contextPrimary.map((s) => (
                <div key={s.id} className="rp-os-context-bit">
                  <p className="rp-os-item-label">{s.label}</p>
                  <p className="rp-os-context-value">{s.state}</p>
                  <WhyLine why={s.why ?? s.context} />
                </div>
              ))}
            </div>
          ) : null}

          {brief.readyLine ? (
            <p className="rp-os-clear">{brief.readyLine}</p>
          ) : null}
        </div>

        {brief.contextPanel ? (
          <ContextPanel panel={brief.contextPanel} onAction={onAction} />
        ) : null}
      </div>
    </section>
  );
}
