"use client";

import { useState } from "react";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

const LEAKS = [
  { id: "labor", label: "Labor", euro: 840, hint: "Mismatch vs demand" },
  { id: "channel", label: "Channel", euro: 4200, hint: "OTA mix drag" },
  { id: "waste", label: "Waste", euro: 310, hint: "Over-prep · spoilage" },
  { id: "cancel", label: "Cancellation", euro: 184, hint: "Unrecovered table" },
  { id: "supplier", label: "Supplier", euro: 273, hint: "Invoice variance" },
  { id: "downtime", label: "Downtime", euro: 420, hint: "Room not ready" },
] as const;

/**
 * Where does your margin go? — one visual flow, not feature cards.
 */
export function SectionLeakageMap() {
  const [active, setActive] = useState<(typeof LEAKS)[number]["id"]>("channel");
  const leak = LEAKS.find((l) => l.id === active) ?? LEAKS[1];
  const total = LEAKS.reduce((s, l) => s + l.euro, 0);

  return (
    <section
      className="rx-spine-section rx-scene rx-leakmap"
      data-nav-theme="light"
      id="leakage-map"
    >
      <div className="rx-shell">
        <header className="rx-spine-head">
          <p className="rx-spine-kicker">Margin flow</p>
          <h2 className="rx-spine-title">Where does your margin go?</h2>
        </header>

        <div className="rx-leakmap-flow" aria-label="Revenue to contribution">
          <div className="rx-leakmap-node" data-role="in">
            <em>Revenue</em>
            <strong>Enters the house</strong>
          </div>

          <ul className="rx-leakmap-leaks" role="tablist" aria-label="Leak points">
            {LEAKS.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={active === l.id}
                  data-on={active === l.id ? "true" : "false"}
                  onClick={() => setActive(l.id)}
                  onMouseEnter={() => setActive(l.id)}
                >
                  <span>{l.label}</span>
                  <strong>−{formatDecisionMoney(l.euro)}</strong>
                </button>
              </li>
            ))}
          </ul>

          <div className="rx-leakmap-detail" role="tabpanel">
            <em>{leak.label}</em>
            <p>
              −{formatDecisionMoney(leak.euro)} · {leak.hint}
            </p>
          </div>

          <div className="rx-leakmap-radr">
            <em>RADR</em>
            <p>Detects · intervenes · verifies</p>
          </div>

          <div className="rx-leakmap-node" data-role="out">
            <em>Contribution retained</em>
            <strong className="rx-econ-verified">
              {formatDecisionMoney(Math.max(0, 18000 - total))}
            </strong>
            <span>Illustrative night · after RADR</span>
          </div>
        </div>

        <p className="rx-pain-punch">
          Revenue is not profit. Operating decisions decide how much survives.
        </p>
      </div>
    </section>
  );
}
