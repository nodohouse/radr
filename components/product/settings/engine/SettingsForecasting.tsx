"use client";

import type { DemoSettingsState } from "@/lib/radr/product/demoSettings";

type Props = {
  demo: DemoSettingsState;
  onPatch: (partial: Partial<DemoSettingsState>) => void;
};

export function SettingsForecasting({ demo, onPatch }: Props) {
  return (
    <section className="se-panel" data-settings-forecasting="true">
      <header className="se-panel-head">
        <div>
          <h2>Forecasting</h2>
          <p>
            Horizons, comparison baselines, and confidence gates. Low confidence
            reduces Autonomy — financial operators cannot auto-execute when
            trust is weak.
          </p>
        </div>
      </header>

      <div className="se-form">
        <div className="se-field">
          <label htmlFor="fc-compare">Primary comparison baseline</label>
          <small>Default variance view across Control Center and dashboards.</small>
          <select
            id="fc-compare"
            value={demo.forecastComparison}
            data-testid="fc-compare"
            onChange={(e) =>
              onPatch({
                forecastComparison: e.target.value as DemoSettingsState["forecastComparison"],
              })
            }
          >
            <option value="plan">Plan</option>
            <option value="forecast">Forecast</option>
            <option value="prior">Prior period</option>
          </select>
        </div>

        <div className="se-field">
          <label htmlFor="fc-rev">Revenue horizon</label>
          <small>Forward window for revenue and contribution outlook.</small>
          <select
            id="fc-rev"
            value={String(demo.forecastRevenueHorizonDays)}
            data-testid="fc-revenue-horizon"
            onChange={(e) =>
              onPatch({ forecastRevenueHorizonDays: Number(e.target.value) })
            }
          >
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>

        <div className="se-field">
          <label htmlFor="fc-live">Live service horizon</label>
          <small>Operations / Live pressure window.</small>
          <select
            id="fc-live"
            value={String(demo.forecastLiveHorizonMin)}
            data-testid="fc-live-horizon"
            onChange={(e) =>
              onPatch({ forecastLiveHorizonMin: Number(e.target.value) })
            }
          >
            <option value="60">60 minutes</option>
            <option value="120">120 minutes</option>
            <option value="180">180 minutes</option>
          </select>
        </div>
      </div>

      <h3 className="se-subhead">Confidence gates</h3>
      <p className="se-subcopy">
        These thresholds integrate with Autonomy. They do not expose raw model
        parameters.
      </p>

      <div className="se-form">
        <div className="se-field">
          <label htmlFor="fc-warn">Below — show warning</label>
          <small>Surfaces a confidence warning on Decisions that depend on forecast.</small>
          <div className="se-field-row">
            <input
              id="fc-warn"
              type="number"
              min={40}
              max={95}
              value={demo.forecastWarnBelow}
              data-testid="fc-warn"
              onChange={(e) =>
                onPatch({ forecastWarnBelow: Number(e.target.value) })
              }
            />
            <span className="se-suffix">%</span>
          </div>
        </div>

        <div className="se-field">
          <label htmlFor="fc-review">Below — require human review</label>
          <small>Decisions using this forecast need explicit approval.</small>
          <div className="se-field-row">
            <input
              id="fc-review"
              type="number"
              min={30}
              max={90}
              value={demo.forecastReviewBelow}
              data-testid="fc-review"
              onChange={(e) =>
                onPatch({ forecastReviewBelow: Number(e.target.value) })
              }
            />
            <span className="se-suffix">%</span>
          </div>
        </div>

        <div className="se-field">
          <label htmlFor="fc-auto">Below — do not auto-execute</label>
          <small>Autonomy drops from EXECUTE to REQUEST APPROVAL or lower.</small>
          <div className="se-field-row">
            <input
              id="fc-auto"
              type="number"
              min={20}
              max={80}
              value={demo.forecastNoAutoBelow}
              data-testid="fc-no-auto"
              onChange={(e) =>
                onPatch({ forecastNoAutoBelow: Number(e.target.value) })
              }
            />
            <span className="se-suffix">%</span>
          </div>
        </div>
      </div>

      <div className="se-callout" data-forecast-autonomy-note="true">
        <strong>Autonomy link</strong>
        <p>
          Current gates: warn &lt;{demo.forecastWarnBelow}% · review &lt;
          {demo.forecastReviewBelow}% · no auto-execute &lt;
          {demo.forecastNoAutoBelow}%. Configure action-level Autonomy in the
          Autonomy section.
        </p>
      </div>
    </section>
  );
}
