"use client";

import { MockupBrand } from "@/components/mockups/MockupBrand";
import { MockupCanvas } from "@/components/mockups/MockupCanvas";
import { LABOR_FINDING } from "@/lib/radr/demoModel";

const SATS = [
  {
    pos: "tl" as const,
    label: "Demand",
    body: "142 forecast covers · 118 booked",
  },
  {
    pos: "tr" as const,
    label: "Schedule",
    body: "4 FOH published · 5 required",
  },
  {
    pos: "bl" as const,
    label: "Service window",
    body: "19:00-20:30 · dinner peak",
  },
  {
    pos: "br" as const,
    label: "Confidence",
    body: LABOR_FINDING.confidenceDisplay,
  },
];

export function IntelligenceMockup() {
  return (
    <MockupCanvas id="intelligence">
      <MockupBrand label="Intelligence" />
      <div className="mk-intel">
        <div className="mk-intel-orbit" aria-hidden="true">
          <span className="mk-intel-ring" />
          <span className="mk-intel-ring" />
          <span className="mk-intel-ring" />
          <span className="mk-intel-beam" />
        </div>

        <div className="mk-intel-sats">
          {SATS.map((s) => (
            <aside key={s.pos} className="mk-intel-sat" data-pos={s.pos}>
              <strong>{s.label}</strong>
              <span>{s.body}</span>
            </aside>
          ))}
        </div>

        <div className="mk-intel-core">
          <p className="mk-intel-time">19:07</p>
          <p className="mk-intel-loc">{LABOR_FINDING.locationName}</p>
          <h1 className="mk-intel-title">Peak service pressure detected</h1>
          <div className="mk-intel-value">
            <h2 className="mk-display mk-money">€1,240</h2>
            <p className="mk-kicker">Revenue at risk</p>
          </div>
        </div>
      </div>
    </MockupCanvas>
  );
}
