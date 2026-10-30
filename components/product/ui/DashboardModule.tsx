"use client";

import type { ReactNode } from "react";
import Link from "next/link";

export type DashboardModuleType =
  | "hero"
  | "decision"
  | "intelligence"
  | "system";

type Props = {
  type: DashboardModuleType;
  title?: string;
  context?: string;
  /** Grid span: 1–12 */
  span?: number;
  spanMd?: number;
  /** Visual hierarchy — Tier 1 dominates, Tier 3 quieter */
  tier?: 1 | 2 | 3;
  /** Instrument identity for distinct information design */
  instrument?:
    | "situation"
    | "judgment"
    | "metric-rail"
    | "activity"
    | "location"
    | "watch"
    | "verification"
    | "health";
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  tone?: "default" | "verified" | "warning" | "decision";
  className?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  /** Hide default header when the instrument provides its own */
  hideHeader?: boolean;
};

/**
 * Premium dashboard module shell.
 * Outside geometry is consistent; inside composition varies by type.
 */
export function DashboardModule({
  type,
  title,
  context,
  span = 12,
  spanMd,
  tier,
  instrument,
  children,
  href,
  onClick,
  tone = "default",
  className = "",
  action,
  hideHeader = false,
}: Props) {
  const interactive = Boolean(href || onClick);
  const showHead = !hideHeader && Boolean(title || context || action);
  const body = (
    <>
      {showHead ? (
        <header className="rp-dash-mod-head">
          <div>
            {title ? <h2 className="rp-dash-mod-title">{title}</h2> : null}
            {context ? <p className="rp-dash-mod-ctx">{context}</p> : null}
          </div>
          {action ? (
            action.href ? (
              <Link href={action.href} className="rp-dash-mod-action">
                {action.label}
              </Link>
            ) : (
              <button
                type="button"
                className="rp-dash-mod-action"
                onClick={action.onClick}
              >
                {action.label}
              </button>
            )
          ) : null}
        </header>
      ) : null}
      <div className="rp-dash-mod-body">{children}</div>
    </>
  );

  const cls = ["rp-dash-mod", className].filter(Boolean).join(" ");

  const style = {
    ["--dash-span" as string]: String(span),
    ["--dash-span-md" as string]: String(spanMd ?? Math.min(span, 8)),
  };

  const data = {
    "data-type": type,
    "data-tone": tone,
    "data-tier": tier != null ? String(tier) : undefined,
    "data-instrument": instrument,
    "data-interactive": interactive ? ("true" as const) : undefined,
  };

  if (href && !onClick) {
    return (
      <Link href={href} className={cls} style={style} {...data}>
        {body}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        className={cls}
        style={style}
        onClick={onClick}
        {...data}
      >
        {body}
      </button>
    );
  }

  return (
    <section className={cls} style={style} {...data}>
      {body}
    </section>
  );
}

export function DashboardGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rp-dash-grid ${className}`.trim()}>{children}</div>
  );
}
