"use client";

import { MockupBrand } from "@/components/mockups/MockupBrand";
import { MockupCanvas } from "@/components/mockups/MockupCanvas";
import { LABOR_FINDING } from "@/lib/radr/demoModel";

export function ActionMockup() {
  return (
    <MockupCanvas id="action">
      <MockupBrand label="Action" />
      <div className="mk-act">
        <div className="mk-act-left">
          <p className="mk-kicker">Berlin Mitte · Labor</p>
          <h1 className="mk-display">Prepared action</h1>
          <div className="mk-act-context">
            <span>Finding</span>
            <strong>{LABOR_FINDING.title}</strong>
            <span>Owner · {LABOR_FINDING.owner}</span>
          </div>
          <p className="mk-act-why">{LABOR_FINDING.why}</p>
        </div>

        <div className="mk-act-card">
          <p className="mk-kicker">Deploy</p>
          <p className="mk-act-rec">+1 FOH</p>
          <p className="mk-act-window">19:00-20:30</p>
          <div className="mk-act-conf">
            <i />
            High confidence · {LABOR_FINDING.confidenceDisplay}
          </div>
          <div className="mk-act-actions">
            <button type="button" className="mk-act-btn" data-primary="true">
              Approve shift add
            </button>
            <button type="button" className="mk-act-btn">
              Review evidence
            </button>
          </div>
          <p className="mk-act-why" style={{ marginTop: 48 }}>
            {LABOR_FINDING.recommend}
          </p>
        </div>
      </div>
    </MockupCanvas>
  );
}
