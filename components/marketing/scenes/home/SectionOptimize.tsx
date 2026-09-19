"use client";

import { useState } from "react";
import { HIDDEN_BY_VERTICAL } from "@/lib/radr/decision/catalog";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { displayDecisionId } from "@/lib/radr/decision/ids";

/**
 * THIS WEEK · OPTIMIZE — distinct from operational incident response.
 */
export function SectionOptimize() {
  const d = HIDDEN_BY_VERTICAL.restaurant;
  const [approved, setApproved] = useState(false);

  return (
    <section
      className="rx-spine-section rx-scene"
      data-nav-theme="light"
      id="optimize"
    >
      <div className="rx-shell">
        <header className="rx-spine-head">
          <p className="rx-spine-kicker">This week · Optimize</p>
          <h2 className="rx-spine-title">
            Your bestseller isn’t your best performer.
          </h2>
          <p className="rx-spine-lead">
            Different horizon from tonight’s incident. RADR surfaces the
            structural menu move while the operation runs.
          </p>
        </header>

        <article className="rx-opt-card" data-id={d.id}>
          <p className="rx-opt-id">
            Decision {displayDecisionId(d.id)} · {d.property}
          </p>
          <div className="rx-opt-evidence">
            <div>
              <strong>Truffle Pasta</strong>
              <span>+34% contribution per kitchen minute</span>
            </div>
            <div>
              <span>Lower peak pressure</span>
              <span>Lower waste</span>
            </div>
          </div>
          <p className="rx-opt-rec-label">RADR recommends</p>
          <p className="rx-opt-rec">{d.action}</p>
          <p className="rx-opt-value">
            Expected this week{" "}
            <strong>
              +{formatDecisionMoney(d.expected?.amount ?? 162)} contribution
            </strong>
          </p>
          <div className="rx-fut-actions">
            <button type="button" className="rx-btn rx-btn-ghost">
              Simulate
            </button>
            <button
              type="button"
              className="rx-btn rx-btn-primary"
              onClick={() => setApproved(true)}
            >
              {approved ? "Test approved" : "Approve test"}
            </button>
          </div>
          <p className="rx-fut-payload">{d.payloadNote}</p>
        </article>
      </div>
    </section>
  );
}
