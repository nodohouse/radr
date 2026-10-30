"use client";

import Link from "next/link";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { LIVE_SCENARIO } from "@/lib/radr/demoClock";

/**
 * Pre-shift — same Live product, before open.
 * What tonight looks like · what could make it hard · what to resolve.
 */
export function PreShiftLiveSurface() {
  const opens = LIVE_SCENARIO.openClock;
  const toOpen = "1H 22M";

  return (
    <section className="rp-live-cmd rp-live-phase" data-phase="pre" aria-label="Pre-shift">
      <header className="rp-oday-hero" data-phase="pre">
        <div className="rp-oday-timeblock">
          <p className="rp-live-loc">
            <span className="rp-live-dot" data-phase="pre" aria-hidden="true" />
            <span className="rp-live-status">PRE-SHIFT</span>
          </p>
          <h2 className="rp-oday-time-h">
            <em>DINNER</em>
            <span>OPENS {opens}</span>
          </h2>
          <p className="rp-oday-time-now">
            <strong>{toOpen}</strong>
            <span>TO OPEN</span>
          </p>
        </div>
        <div className="rp-oday-hero-nums" data-secondary="true">
          <div>
            <strong>{formatDecisionMoney(26800)}</strong>
            <span>Expected revenue</span>
          </div>
          <div>
            <strong>184</strong>
            <span>Expected covers</span>
          </div>
          <div>
            <strong>32–44</strong>
            <span>Walk-ins</span>
          </div>
          <div data-em="true">
            <strong>20:10–20:35</strong>
            <span>Peak</span>
          </div>
        </div>
      </header>

      <section className="rp-live-pre-risk" aria-label="What could make tonight difficult">
        <p className="rp-live-k">What could make tonight difficult</p>
        <ul>
          <li>
            <em>Staff</em>
            <strong>1 line cook short</strong>
            <span>Peak band 20:00–21:00</span>
          </li>
          <li>
            <em>Stock</em>
            <strong>Tuna watch</strong>
            <span>31 portions demand vs 24 on hand</span>
          </li>
          <li>
            <em>Context</em>
            <strong>Concert nearby · Rain 20:10</strong>
            <span>Demand +12% · terrace −8 covers</span>
          </li>
          <li>
            <em>Reservations</em>
            <strong>38 high-density arrivals ~20:00</strong>
            <span>Watch kitchen pressure</span>
          </li>
        </ul>
      </section>

      <section className="rp-live-pre-resolve" aria-label="Resolve before open">
        <p className="rp-live-k">2 things to resolve before open</p>
        <ul>
          <li>
            <Link href={`/app/decisions/${DECISION_IDS.peak}`}>
              <em>{displayDecisionId(DECISION_IDS.peak)}</em>
              <strong>Staffing Futures for peak</strong>
              <span>Decision · Compare coverage options</span>
            </Link>
          </li>
          <li>
            <button type="button" className="rp-live-pre-watch" disabled>
              <em>Watching</em>
              <strong>Tuna portions vs demand</strong>
              <span>No action unless shortage firms</span>
            </button>
          </li>
        </ul>
      </section>
    </section>
  );
}
