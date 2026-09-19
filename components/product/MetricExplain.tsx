"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getTerm,
  isTermFresh,
  markTermSeen,
  type TermId,
} from "@/lib/radr/terminology";

type MetricExplainProps = {
  metric: TermId;
  /** Override visible label; defaults to definition term. */
  children?: ReactNode;
  className?: string;
  /** Expand abbreviation on first display (FOH → Front of House (FOH)) */
  expandAbbrev?: boolean;
};

/**
 * Subtle label + tip. Hover / focus / click / Escape.
 * Never a giant help icon. Progressive disclosure into calculation.
 */
export function MetricExplain({
  metric,
  children,
  className,
  expandAbbrev = false,
}: MetricExplainProps) {
  const def = getTerm(metric);
  const tipId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [fresh, setFresh] = useState(false);

  useEffect(() => {
    setFresh(isTermFresh(metric));
  }, [metric]);

  useEffect(() => {
    if (!open) return;
    markTermSeen(metric);
    setFresh(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setShowCalc(false);
      }
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
        setShowCalc(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("touchstart", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("touchstart", onPointer);
    };
  }, [open, metric]);

  const label =
    children ??
    (expandAbbrev && def.expandsTo
      ? `${def.expandsTo} (${def.term})`
      : def.term);

  return (
    <span
      ref={rootRef}
      className={`rp-metric-explain ${className ?? ""}`.trim()}
      data-fresh={fresh ? "true" : undefined}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        if (!showCalc) setOpen(false);
      }}
    >
      <button
        type="button"
        className="rp-metric-explain-trigger"
        aria-describedby={open ? tipId : undefined}
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          if (open) setShowCalc(false);
        }}
        onFocus={() => setOpen(true)}
      >
        <span className="rp-metric-explain-label">{label}</span>
        <span className="rp-metric-explain-mark" aria-hidden="true">
          ⓘ
        </span>
      </button>
      {open ? (
        <span
          id={tipId}
          role="tooltip"
          className="rp-metric-tip"
          data-calc={showCalc ? "true" : undefined}
        >
          <strong className="rp-metric-tip-title">{def.term}</strong>
          {def.expandsTo ? (
            <span className="rp-metric-tip-expand">{def.expandsTo}</span>
          ) : null}
          <span className="rp-metric-tip-body">{def.shortDefinition}</span>
          {def.example ? (
            <span className="rp-metric-tip-example">
              <em>Example</em>
              {def.example}
            </span>
          ) : null}
          {showCalc ? (
            <span className="rp-metric-tip-detail">
              {def.calculationDescription ? (
                <span>
                  <em>How calculated</em>
                  {def.calculationDescription}
                  {def.configurable
                    ? " Uses your organization's configured definition where applicable."
                    : null}
                </span>
              ) : null}
              {def.dataSources?.length ? (
                <span>
                  <em>Data sources</em>
                  {def.dataSources.join(" · ")}
                </span>
              ) : null}
              {def.lastUpdated ? (
                <span className="rp-metric-tip-updated">
                  Updated · {def.lastUpdated}
                </span>
              ) : null}
            </span>
          ) : null}
          {def.calculationDescription || def.dataSources?.length ? (
            <button
              type="button"
              className="rp-metric-tip-more"
              onClick={(e) => {
                e.stopPropagation();
                setShowCalc((v) => !v);
              }}
            >
              {showCalc ? "Hide detail" : "How is this calculated? →"}
            </button>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

type MetricDefinitionPanelProps = {
  metric: TermId;
  valueDisplay?: string;
};

/** On-demand definition panel: not permanent chrome. */
export function MetricDefinition({
  metric,
  valueDisplay,
}: MetricDefinitionPanelProps) {
  const def = getTerm(metric);
  return (
    <div className="rp-metric-def">
      <p className="rp-metric-def-label">{def.term}</p>
      {valueDisplay ? (
        <p className="rp-metric-def-value">{valueDisplay}</p>
      ) : null}
      <p className="rp-metric-def-body">{def.shortDefinition}</p>
      {def.example ? (
        <p className="rp-metric-def-calc">
          <em>Example</em>
          {def.example}
        </p>
      ) : null}
      {def.calculationDescription ? (
        <p className="rp-metric-def-calc">
          <em>Calculated using</em>
          {def.calculationDescription}
          {def.configurable
            ? " · Configurable per organization."
            : null}
        </p>
      ) : null}
      {def.dataSources?.length ? (
        <ul className="rp-metric-def-sources">
          {def.dataSources.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ) : null}
      {def.lastUpdated ? (
        <p className="rp-metric-def-updated">Last updated · {def.lastUpdated}</p>
      ) : null}
    </div>
  );
}

type ExplainedStatProps = {
  value: ReactNode;
  metric: TermId;
  /** Override Layer-1 subtitle; defaults to term.subtitle */
  subtitle?: string;
  className?: string;
  valueClassName?: string;
};

/**
 * Layer 1 metric cell: value · term (with tip) · plain subtitle.
 */
export function ExplainedStat({
  value,
  metric,
  subtitle,
  className,
  valueClassName,
}: ExplainedStatProps) {
  const def = getTerm(metric);
  const line = subtitle ?? def.subtitle;
  return (
    <div className={`rp-explained-stat ${className ?? ""}`.trim()}>
      <strong className={valueClassName}>{value}</strong>
      <MetricExplain metric={metric} />
      {line ? <span className="rp-explained-stat-sub">{line}</span> : null}
    </div>
  );
}
