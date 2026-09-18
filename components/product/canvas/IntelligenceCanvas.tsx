"use client";

import type { ReactNode } from "react";

/**
 * Immersive Intelligence Canvas — mineral surface inside ivory app.
 * For Futures · Margin Response · Menu · Service · Replay.
 */
export function IntelligenceCanvas({
  kicker,
  title,
  children,
  inspector,
  className = "",
}: {
  kicker?: string;
  title?: string;
  children: ReactNode;
  inspector?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rp-icanvas ${className}`.trim()}>
      {(kicker || title) && (
        <header className="rp-icanvas-head">
          {kicker ? <p className="rp-icanvas-kicker">{kicker}</p> : null}
          {title ? <h2 className="rp-icanvas-title">{title}</h2> : null}
        </header>
      )}
      <div
        className="rp-icanvas-body"
        data-inspector={inspector ? "true" : undefined}
      >
        <div className="rp-icanvas-stage">{children}</div>
        {inspector ? (
          <aside className="rp-icanvas-inspector">{inspector}</aside>
        ) : null}
      </div>
    </div>
  );
}
