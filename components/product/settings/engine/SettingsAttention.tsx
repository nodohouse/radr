"use client";

import type { DemoSettingsState } from "@/lib/radr/product/demoSettings";

type Props = {
  demo: DemoSettingsState;
  onPatch: (partial: Partial<DemoSettingsState>) => void;
};

export function SettingsAttention({ demo, onPatch }: Props) {
  return (
    <section className="se-panel" data-settings-attention="true">
      <header className="se-panel-head">
        <div>
          <h2>Attention</h2>
          <p>
            What interrupts humans. Materiality, urgency, and noise control —
            brief instead of alert when value is low.
          </p>
        </div>
      </header>

      <div className="se-form">
        <div className="se-field">
          <label htmlFor="att-mat">Minimum materiality</label>
          <small>
            Findings below this € threshold go to briefing, not interrupt.
          </small>
          <div className="se-field-row">
            <span className="se-suffix">€</span>
            <input
              id="att-mat"
              type="number"
              min={20}
              max={5000}
              step={10}
              value={demo.attentionMaterialityEuro}
              data-testid="attention-materiality"
              onChange={(e) =>
                onPatch({ attentionMaterialityEuro: Number(e.target.value) })
              }
            />
          </div>
        </div>
        <div className="se-field">
          <label>CFO interrupt example</label>
          <small>Deterministic demo rule — not a live alert engine.</small>
          <input
            readOnly
            value="Exposure >€2,500 · confidence >75% · deadline <2h"
          />
        </div>
      </div>

      <h3 className="se-subhead">Noise control</h3>
      <div className="se-signal-grid" style={{ marginTop: 8 }}>
        {[
          "Collapse repeated issues",
          "Group same-driver alerts",
          "Suppress resolved conditions",
          "Mute low-materiality findings",
          "Brief instead of alert",
        ].map((label) => (
          <article key={label} className="se-signal">
            <div>
              <strong>{label}</strong>
              <p>Enabled for demo personas.</p>
            </div>
            <button
              type="button"
              className="se-toggle"
              data-on="true"
              aria-pressed="true"
              aria-label={label}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
