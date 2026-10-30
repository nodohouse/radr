"use client";

/**
 * Decision object film — Evidence → Verified Value.
 * Canonical public restaurant peak (D-1911 · Soho · New York).
 */

import Link from "next/link";
import { PUBLIC_RESTAURANT } from "@/lib/marketing/publicCanon";

const CHAIN = [
  {
    k: "Evidence",
    v: `${PUBLIC_RESTAURANT.clock} · Kitchen →97% · 38 inbound · Tuna stockout 21:18`,
  },
  { k: "Futures", v: "Pace seating 12 · Seat now · Throttle delivery" },
  {
    k: "Decision",
    v: `${PUBLIC_RESTAURANT.actionLabel.toUpperCase()} · HOLD Tuna · PUSH Truffle + House White`,
  },
  { k: "Expected", v: `${PUBLIC_RESTAURANT.expectedFormatted} contribution` },
  { k: "Action", v: "Prepared for approval · throttle + menu hold" },
  { k: "Outcome", v: "Peak cleared · kitchen recovered" },
  { k: "Verified", v: "Contribution protected · sealed in Ledger" },
  { k: "Memory", v: "Friday peak playbook V3" },
] as const;

export function DecisionObjectFilm() {
  return (
    <section
      className="rx-dof"
      data-nav-theme="light"
      aria-labelledby="rx-dof-title"
    >
      <div className="rx-shell">
        <p className="rx-rec-k">The Decision object</p>
        <h2 id="rx-dof-title" className="rx-rec-h">
          Evidence → Futures → Decision → Proof.
        </h2>
        <p className="rx-rec-p" style={{ maxWidth: "36rem" }}>
          Not a tip. A Decision with economics, options, and a verification path.
        </p>

        <div
          className="rx-dof-scene"
          aria-label={`${PUBLIC_RESTAURANT.displayName} peak Decision`}
        >
          <p className="rx-dof-clock">{PUBLIC_RESTAURANT.clockLine}</p>
          <h3 className="rx-dof-verb">{PUBLIC_RESTAURANT.actionShort}</h3>
          <ul className="rx-dof-facts">
            <li>Kitchen heading to 97%</li>
            <li>38 covers inbound</li>
            <li>Tuna stockout projected 21:18</li>
            <li>
              Tuna is #1 seller — Truffle Pasta wins contribution per kitchen
              minute
            </li>
          </ul>
          <p className="rx-dof-econ">
            <strong>{PUBLIC_RESTAURANT.expectedFormatted}</strong>
            <span>expected contribution · cost of doing nothing modeled</span>
          </p>
        </div>

        <ol className="rx-dof-chain" aria-label="Decision chain">
          {CHAIN.map((c) => (
            <li key={c.k}>
              <em>{c.k}</em>
              <span>{c.v}</span>
            </li>
          ))}
        </ol>

        <p className="rx-dof-cta">
          <Link
            href="/signup?intent=demo&next=/app/enter"
            className="rx-btn rx-btn-ghost"
          >
            See the full Decision in RADR <span aria-hidden="true">→</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
