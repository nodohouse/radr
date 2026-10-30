"use client";

import Link from "next/link";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { LIVE_SCENARIO } from "@/lib/radr/demoClock";

/**
 * Post-shift — same Live product, after close.
 * Performance · Decisions · Verified · What RADR learned.
 */
export function PostShiftLiveSurface() {
  return (
    <section
      className="rp-live-cmd rp-live-phase"
      data-phase="post"
      aria-label="Post-shift"
    >
      <header className="rp-oday-hero" data-phase="post">
        <div className="rp-oday-timeblock">
          <p className="rp-live-loc">
            <span className="rp-live-dot" data-phase="post" aria-hidden="true" />
            <span className="rp-live-status">CLOSED</span>
          </p>
          <h2 className="rp-oday-time-h">
            <em>SERVICE COMPLETE</em>
            <span>CLOSED {LIVE_SCENARIO.closeClock}</span>
          </h2>
        </div>
        <div className="rp-oday-hero-nums" data-secondary="true">
          <div data-em="true">
            <strong>{formatDecisionMoney(27240)}</strong>
            <span>Revenue · vs $26.8k forecast</span>
          </div>
          <div>
            <strong>{formatDecisionMoney(7810)}</strong>
            <span>Contribution · vs expected</span>
          </div>
          <div>
            <strong>20:10</strong>
            <span>Peak pressure</span>
          </div>
          <div>
            <strong>326</strong>
            <span>Covers</span>
          </div>
        </div>
      </header>

      <div className="rp-live-post-grid">
        <section aria-label="Decisions and value">
          <p className="rp-live-k">Tonight</p>
          <dl className="rp-live-post-dl">
            <div>
              <dt>Decisions made</dt>
              <dd>3</dd>
            </div>
            <div>
              <dt>Actions taken</dt>
              <dd>2</dd>
            </div>
            <div data-tone="verified">
              <dt>Verified Value</dt>
              <dd>{formatDecisionMoney(590)}</dd>
            </div>
            <div>
              <dt>Awaiting verification</dt>
              <dd>{formatDecisionMoney(180)}</dd>
            </div>
          </dl>
          <Link
            href={`/app/decisions/${DECISION_IDS.peak}`}
            className="rp-live-post-dec"
          >
            <em>{displayDecisionId(DECISION_IDS.peak)}</em>
            <strong>Wait 12 minutes · Verified €590</strong>
          </Link>
        </section>

        <section aria-label="What RADR learned">
          <p className="rp-live-k">What RADR learned</p>
          <p className="rp-live-post-learn">
            2 operating patterns updated · Peak hold playbook → V4 · Forecast
            error 8.9% → 5.4% on Friday dinner.
          </p>
          <Link href="/app/memory" className="rp-ccx-more">
            Review service →
          </Link>
        </section>
      </div>
    </section>
  );
}
