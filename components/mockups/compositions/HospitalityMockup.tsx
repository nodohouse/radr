"use client";

import { MockupBrand } from "@/components/mockups/MockupBrand";
import { MockupCanvas } from "@/components/mockups/MockupCanvas";

const TABLES = [
  { left: "18%", top: "38%", lit: false },
  { left: "28%", top: "52%", lit: true },
  { left: "38%", top: "40%", lit: true },
  { left: "48%", top: "58%", lit: false },
  { left: "58%", top: "44%", lit: true },
  { left: "68%", top: "56%", lit: false },
  { left: "76%", top: "42%", lit: true },
  { left: "22%", top: "66%", lit: false },
  { left: "42%", top: "68%", lit: true },
  { left: "62%", top: "70%", lit: false },
];

export function HospitalityMockup() {
  return (
    <MockupCanvas id="hospitality">
      <div className="mk-hos">
        <div className="mk-hos-atmosphere" aria-hidden="true" />
        <div className="mk-hos-grain" aria-hidden="true" />
        <div className="mk-hos-floor" aria-hidden="true">
          <div className="mk-hos-tables">
            {TABLES.map((t, i) => (
              <span
                key={i}
                className="mk-hos-table"
                data-lit={t.lit ? "true" : undefined}
                style={{ left: t.left, top: t.top }}
              />
            ))}
          </div>
        </div>

        <MockupBrand label="Hospitality" />

        <div className="mk-hos-copy">
          <p className="mk-kicker">Above the floor</p>
          <h1 className="mk-display">Intelligence that stays invisible.</h1>
          <p>
            RADR reads the financial and operational truth of service - without
            becoming another screen on the floor.
          </p>
        </div>

        <aside
          className="mk-hos-overlay"
          data-green="true"
          style={{ right: "10%", top: "32%" }}
        >
          <em>Live · Section B</em>
          <strong>€1,240 at risk</strong>
          <span>Peak pressure · +1 FOH recommended</span>
        </aside>

        <aside
          className="mk-hos-overlay"
          style={{ right: "18%", bottom: "22%" }}
        >
          <em>Buy · FreshCo</em>
          <strong>€118 recoverable</strong>
          <span>Invoice above contract · 18 lines</span>
        </aside>

        <aside
          className="mk-hos-overlay"
          style={{ left: "42%", top: "28%" }}
        >
          <em>Service · 19:07</em>
          <strong>84% occupancy</strong>
          <span>Demand curve ahead of schedule</span>
        </aside>
      </div>
    </MockupCanvas>
  );
}
