"use client";

import { DAILY_PULSE } from "@/lib/radr/operatingPulse";
import { formatSignedPct } from "@/lib/product/demo/command";
import { ExplainedStat } from "@/components/product/MetricExplain";
import { Sparkline } from "@/components/product/LiveVisuals";
import { PULSE_SPARKS } from "@/lib/radr/liveVisuals";
import { TERRITORY_COLORS } from "@/lib/radr/brandTokens";

type Props = {
  compact?: boolean;
};

/** Secondary context: quieter than Attention, with 7-day direction sparklines. */
export function DailyPulse({ compact = true }: Props) {
  const p = DAILY_PULSE;
  const vsForecastEuro = Math.round(
    p.revenue - p.revenue / (1 + p.revenueVsForecast / 100),
  );

  return (
    <section
      className="rp-pulse rp-pulse-quiet"
      aria-label="Daily Pulse"
      data-compact={compact ? "true" : undefined}
    >
      <header className="rp-pulse-head">
        <p className="rp-glance-label">Yesterday</p>
        <p className="rp-pulse-when">
          <em>{p.periodDate}</em>
        </p>
      </header>

      <p className="rp-pulse-verdict">
        Yesterday finished above plan
        <span>
          Revenue {formatSignedPct(p.revenueVsForecast)} vs forecast
          {vsForecastEuro > 0 ? ` · +€${vsForecastEuro}` : null}
        </span>
      </p>

      <div className="rp-pulse-grid" data-compact={compact ? "true" : undefined}>
        <div className="rp-pulse-metric">
          <ExplainedStat
            value={p.revenueDisplay}
            metric="revenue"
            subtitle={`${formatSignedPct(p.revenueVsForecast)} vs forecast`}
          />
          <Sparkline
            values={PULSE_SPARKS.revenue}
            color="rgba(0,245,122,0.65)"
            label="Revenue · 7 days"
            unit="euro"
          />
        </div>
        <div className="rp-pulse-metric">
          <ExplainedStat
            value={`${p.margin.toFixed(1)}%`}
            metric="operatingMargin"
            subtitle={`${p.marginVsPlanPts >= 0 ? "+" : ""}${p.marginVsPlanPts.toFixed(1)} pts vs plan`}
          />
          <Sparkline
            values={PULSE_SPARKS.margin}
            color="rgba(255,255,255,0.45)"
            label="Operating margin · 7 days"
            unit="pct"
          />
        </div>
        <div className="rp-pulse-metric">
          <ExplainedStat
            value={p.covers}
            metric="covers"
            subtitle={`+${p.why.covers.toFixed(1)}% vs forecast`}
          />
          <Sparkline
            values={PULSE_SPARKS.covers}
            color="rgba(255,255,255,0.45)"
            label="Covers · 7 days"
            unit="number"
          />
        </div>
        <div className="rp-pulse-metric">
          <ExplainedStat
            value={p.revenuePerCoverDisplay}
            metric="averageSpendPerCover"
            subtitle={`+${p.why.avgSpend.toFixed(1)}% vs forecast`}
          />
          <Sparkline
            values={PULSE_SPARKS.avgSpend}
            color="rgba(255,255,255,0.45)"
            label="Avg spend · 7 days"
            unit="euro"
          />
        </div>
        <div className="rp-pulse-metric">
          <ExplainedStat
            value={`${p.laborPct.toFixed(1)}%`}
            metric="laborCostPct"
            subtitle={`${p.laborVsPlanPts >= 0 ? "+" : ""}${p.laborVsPlanPts.toFixed(1)} pts vs plan`}
          />
          <Sparkline
            values={PULSE_SPARKS.labor}
            color={TERRITORY_COLORS.LABOR}
            label="Labor cost · 7 days"
            unit="pct"
          />
        </div>
      </div>

      <p className="rp-pulse-drivers">
        Driven by covers +{p.why.covers.toFixed(1)}% · avg spend +
        {p.why.avgSpend.toFixed(1)}%
      </p>
    </section>
  );
}
