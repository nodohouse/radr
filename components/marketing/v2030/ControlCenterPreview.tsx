"use client";

/**
 * Glass Overview float — mockup density, publicCanon economics only.
 * Hotel story (Mercer) to match coastal hero photography.
 */

import { PUBLIC_HOTEL, PUBLIC_RESTAURANT, PUBLIC_SUPPLIER } from "@/lib/marketing/publicCanon";

const NAV = [
  { label: "Overview", on: true },
  { label: "Decisions", on: false },
  { label: "Live", on: false },
  { label: "Operations", on: false },
  { label: "Value", on: false },
  { label: "Memory", on: false },
] as const;

/** Simple honest spark — shape only, not a claimed portfolio trend. */
function Spark() {
  return (
    <svg viewBox="0 0 280 88" className="rx30-cc-spark" aria-hidden="true">
      <defs>
        <linearGradient id="rx30SparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00c96a" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#00c96a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 62 C 28 58, 42 48, 58 52 C 78 58, 92 34, 112 30 C 132 26, 148 44, 168 38 C 188 32, 204 18, 224 22 C 244 26, 258 14, 280 10 L 280 88 L 0 88 Z"
        fill="url(#rx30SparkFill)"
      />
      <path
        d="M0 62 C 28 58, 42 48, 58 52 C 78 58, 92 34, 112 30 C 132 26, 148 44, 168 38 C 188 32, 204 18, 224 22 C 244 26, 258 14, 280 10"
        fill="none"
        stroke="#00a85a"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ControlCenterPreview() {
  return (
    <div className="rx30-cc" aria-hidden="true">
      <aside className="rx30-cc-rail">
        <div className="rx30-cc-mark" />
        {NAV.map((n) => (
          <span key={n.label} data-on={n.on ? "true" : undefined} title={n.label} />
        ))}
      </aside>

      <div className="rx30-cc-main">
        <header className="rx30-cc-top">
          <div>
            <p className="rx30-cc-greeting">Overview</p>
            <strong>{PUBLIC_HOTEL.displayName}</strong>
            <em>{PUBLIC_HOTEL.clockLine}</em>
          </div>
          <span className="rx30-cc-pill">Needs you · 1</span>
        </header>

        <p className="rx30-demo-label">Illustrative RADR demo</p>

        <div className="rx30-cc-kpis">
          <article>
            <span>Expected</span>
            <strong>{PUBLIC_HOTEL.expectedFormatted}</strong>
            <em>Housekeeping wave</em>
          </article>
          <article>
            <span>Exposure</span>
            <strong>{PUBLIC_HOTEL.exposureFormatted}</strong>
            <em>2 rooms at risk</em>
          </article>
          <article>
            <span>Verified</span>
            <strong>{PUBLIC_SUPPLIER.verifiedFormatted}</strong>
            <em>{PUBLIC_SUPPLIER.displayId} sealed</em>
          </article>
          <article>
            <span>Restaurant</span>
            <strong>{PUBLIC_RESTAURANT.expectedFormatted}</strong>
            <em>Soho · dinner</em>
          </article>
        </div>

        <div className="rx30-cc-body">
          <div className="rx30-cc-chart">
            <div className="rx30-cc-chart-head">
              <div>
                <span>Operating pressure</span>
                <strong>Check-in wave · today</strong>
              </div>
              <em>Demo series</em>
            </div>
            <Spark />
          </div>

          <div className="rx30-cc-decision">
            <p className="rx30-cc-decision-k">Primary Decision</p>
            <h3>{PUBLIC_HOTEL.actionLabel}</h3>
            <p>
              Arrivals at risk if rooms stay offline. Reassign housekeeping now
              to protect the wave.
            </p>
            <div className="rx30-cc-decision-row">
              <span>Expected</span>
              <strong>{PUBLIC_HOTEL.expectedFormatted}</strong>
            </div>
            <div className="rx30-cc-decision-actions">
              <span data-primary="true">Prepare</span>
              <span>Compare futures</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
