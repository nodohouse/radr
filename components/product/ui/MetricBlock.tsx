/**
 * Metric composition — never concatenate label+value+delta in one text node.
 * Use flex/grid + gap. Semantic glyph deltas live in MetricDelta.tsx.
 */

import type { ReactNode } from "react";

type Tone = "pos" | "neg" | "warn" | "ok";

/** Vertical stack: label → value → delta → status */
export function Metric({
  children,
  tone,
  layout = "stack",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  layout?: "stack" | "row" | "inline";
  className?: string;
}) {
  return (
    <div
      className={`rp-metric ${className}`.trim()}
      data-tone={tone}
      data-layout={layout}
    >
      {children}
    </div>
  );
}

export function MetricBlock({
  value,
  label,
  delta,
  meta,
  status,
  tone,
  className = "",
}: {
  value: ReactNode;
  label: ReactNode;
  delta?: ReactNode;
  meta?: ReactNode;
  status?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const deltaTone =
    tone === "ok" ? "pos" : tone === "neg" || tone === "warn" ? tone : undefined;
  return (
    <Metric tone={tone} className={className}>
      <MetricLabel>{label}</MetricLabel>
      <MetricValue>{value}</MetricValue>
      {delta != null ? (
        <MetricDeltaText tone={deltaTone}>{delta}</MetricDeltaText>
      ) : null}
      {status != null ? <MetricStatus>{status}</MetricStatus> : null}
      {meta != null ? <MetricMeta>{meta}</MetricMeta> : null}
    </Metric>
  );
}

export function MetricValue({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`rp-metric-value ${className}`.trim()}>{children}</span>
  );
}

export function MetricLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`rp-metric-label ${className}`.trim()}>{children}</span>
  );
}

/** Plain signed delta text (not the semantic glyph MetricDelta). */
export function MetricDeltaText({
  children,
  tone,
}: {
  children: ReactNode;
  tone?: "pos" | "neg" | "warn";
}) {
  return (
    <span className="rp-metric-delta" data-tone={tone}>
      {children}
    </span>
  );
}

/** @deprecated Use MetricDeltaText — avoids clash with semantic MetricDelta.tsx */
export function MetricDelta({
  children,
  tone,
}: {
  children: ReactNode;
  tone?: "pos" | "neg" | "warn";
}) {
  return <MetricDeltaText tone={tone}>{children}</MetricDeltaText>;
}

export function MetricStatus({ children }: { children: ReactNode }) {
  return <span className="rp-metric-status">{children}</span>;
}

export function MetricMeta({ children }: { children: ReactNode }) {
  return <span className="rp-metric-meta">{children}</span>;
}

export function MetricState({
  children,
  state,
}: {
  children: ReactNode;
  state?: "live" | "warn" | "neg" | "ok";
}) {
  return (
    <span className="rp-metric-state" data-state={state}>
      {children}
    </span>
  );
}

/** Horizontal metric row for bridges / tables — label | track | value */
export function MetricRow({
  label,
  value,
  track,
  tone,
  onClick,
}: {
  label: ReactNode;
  value: ReactNode;
  track?: ReactNode;
  tone?: "pos" | "neg";
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      className="rp-metric-row"
      data-tone={tone}
      onClick={onClick}
    >
      <MetricLabel>{label}</MetricLabel>
      {track != null ? <span className="rp-metric-row-track">{track}</span> : null}
      <MetricValue>{value}</MetricValue>
    </Tag>
  );
}
