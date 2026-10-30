"use client";

import type { DemoSettingsState } from "@/lib/radr/product/demoSettings";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import {
  CURRENCY_OPTIONS,
  FISCAL_OPTIONS,
  OPERATING_MODEL_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/lib/radr/product/settingsProofEngine";
import { SettingsGovernanceRail } from "./SettingsGovernanceRail";

type Props = {
  demo: DemoSettingsState;
  vertical: DemoVerticalFamily;
  onPatch: (partial: Partial<DemoSettingsState>) => void;
  onIndustry: (v: DemoVerticalFamily) => void;
};

export function SettingsOrganization({
  demo,
  vertical,
  onPatch,
  onIndustry,
}: Props) {
  const industryLabel = vertical === "hotel" ? "Hotels" : "Restaurants";

  return (
    <div className="se-org-grid" data-settings-organization="true">
      <section className="se-panel">
        <header className="se-panel-head">
          <div>
            <h2>Organization</h2>
            <p>
              Core settings for your organization. These preferences control how
              RADR interprets your data, calendars and operating structure.
            </p>
          </div>
          <a
            className="se-docs"
            href="/en/docs"
            target="_blank"
            rel="noreferrer"
          >
            View documentation ↗
          </a>
        </header>

        <div
          className="se-industry"
          role="group"
          aria-label="Industry mode"
        >
          <button
            type="button"
            data-active={vertical === "restaurant" ? "true" : undefined}
            data-testid="industry-restaurants"
            onClick={() => onIndustry("restaurant")}
          >
            Restaurants
          </button>
          <button
            type="button"
            data-active={vertical === "hotel" ? "true" : undefined}
            data-testid="industry-hotels"
            onClick={() => onIndustry("hotel")}
          >
            Hotels
          </button>
        </div>

        <div className="se-form">
          <div className="se-field" data-span="2">
            <label htmlFor="se-org-name">Organization name</label>
            <small>This name appears across RADR and exports.</small>
            <input
              id="se-org-name"
              value={demo.orgName}
              data-testid="org-name"
              onChange={(e) => onPatch({ orgName: e.target.value })}
            />
          </div>

          <div className="se-field">
            <label htmlFor="se-currency">Primary currency</label>
            <small>Used for financials, reporting and forecasts.</small>
            <select
              id="se-currency"
              value={demo.currency}
              data-testid="org-currency"
              onChange={(e) => onPatch({ currency: e.target.value })}
            >
              {CURRENCY_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="se-field">
            <label htmlFor="se-tz">Default timezone</label>
            <small>Used for calendars, reporting and notifications.</small>
            <select
              id="se-tz"
              value={demo.timezone}
              data-testid="org-timezone"
              onChange={(e) => onPatch({ timezone: e.target.value })}
            >
              {TIMEZONE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="se-field">
            <label htmlFor="se-fiscal">Fiscal calendar</label>
            <small>Defines reporting periods and year boundaries.</small>
            <select
              id="se-fiscal"
              value={demo.fiscalCalendar}
              data-testid="org-fiscal"
              onChange={(e) => onPatch({ fiscalCalendar: e.target.value })}
            >
              {FISCAL_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="se-field">
            <label htmlFor="se-model">Operating model</label>
            <small>
              Affects personas, terminology, and default operating surfaces.
            </small>
            <select
              id="se-model"
              value={demo.operatingModel}
              data-testid="org-model"
              onChange={(e) => onPatch({ operatingModel: e.target.value })}
            >
              {OPERATING_MODEL_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <SettingsGovernanceRail demo={demo} industryLabel={industryLabel} />
    </div>
  );
}
