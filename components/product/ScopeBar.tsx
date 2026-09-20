"use client";

import { ORG } from "@/lib/product/demo/catalog";
import {
  PERIOD_OPTIONS,
  type DashPeriod,
} from "@/lib/product/demo/dashboard";
import { useProduct } from "@/lib/product/store";

type Props = {
  compact?: boolean;
  /** Location is controlled by LocationSwitcher; top bar only needs period */
  periodOnly?: boolean;
};

export function ScopeBar({ compact, periodOnly }: Props) {
  const { period, setPeriod, openLocationSwitcher, locationScope } =
    useProduct();

  return (
    <div className={compact ? "rp-scope rp-scope-compact" : "rp-scope"}>
      {!compact ? <p className="rp-scope-org">{ORG.name}</p> : null}
      <div className="rp-scope-selects">
        {!periodOnly ? (
          <button
            type="button"
            className="rp-scope-loc-btn"
            onClick={openLocationSwitcher}
          >
            {locationScope === "all" ? "All locations" : locationScope}
          </button>
        ) : null}
        <label className="rp-cc-select">
          <span className="sr-only">Period</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as DashPeriod)}
          >
            {PERIOD_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
