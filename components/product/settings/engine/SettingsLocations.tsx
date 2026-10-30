"use client";

import { useEffect, useMemo, useState } from "react";
import type { DemoOrganization } from "@/lib/radr/demo/organizations";
import {
  effectiveLocationConfig,
  locationSettingsRow,
  type DemoSettingsState,
  type LocationOverride,
} from "@/lib/radr/product/demoSettings";
import {
  CURRENCY_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/lib/radr/product/settingsProofEngine";

type Props = {
  org: DemoOrganization;
  demo: DemoSettingsState;
  onPatch: (partial: Partial<DemoSettingsState>) => void;
};

export function SettingsLocations({ org, demo, onPatch }: Props) {
  const [selectedId, setSelectedId] = useState(
    org.locations[0]?.id ?? "loc_berlin_mitte",
  );

  useEffect(() => {
    if (!org.locations.some((l) => l.id === selectedId)) {
      setSelectedId(org.locations[0]?.id ?? "loc_berlin_mitte");
    }
  }, [org.locations, selectedId]);

  const selected = useMemo(
    () => org.locations.find((l) => l.id === selectedId) ?? org.locations[0],
    [org.locations, selectedId],
  );

  const meta = selected ? locationSettingsRow(selected.id) : undefined;
  const effective = selected
    ? effectiveLocationConfig(selected.id, demo)
    : null;

  const setOverride = (patch: LocationOverride) => {
    if (!selected) return;
    const prev = demo.locationOverrides[selected.id] ?? {};
    const next: LocationOverride = { ...prev, ...patch };
    // Clear nullish keys so inheritance returns.
    for (const k of Object.keys(next) as (keyof LocationOverride)[]) {
      if (next[k] == null || next[k] === "") delete next[k];
    }
    const locationOverrides = { ...demo.locationOverrides };
    if (Object.keys(next).length === 0) delete locationOverrides[selected.id];
    else locationOverrides[selected.id] = next;

    const berlinClose =
      selected.id === "loc_berlin_mitte" && patch.closeClock != null
        ? patch.closeClock
        : demo.berlinClose;

    onPatch({ locationOverrides, berlinClose });
  };

  const resetField = (field: keyof LocationOverride) => {
    if (!selected) return;
    setOverride({ [field]: null });
  };

  return (
    <div className="se-split" data-settings-locations="true">
      <section className="se-panel">
        <header className="se-panel-head">
          <div>
            <h2>Locations</h2>
            <p>
              Configure operating type, hours, systems, and overrides per venue.
              Organization defaults apply until a location overrides them.
            </p>
          </div>
        </header>

        <div className="se-table-wrap">
          <table className="se-table" aria-label="Locations">
            <thead>
              <tr>
                <th>Location</th>
                <th>City</th>
                <th>Type</th>
                <th>Hours</th>
                <th>Inheritance</th>
              </tr>
            </thead>
            <tbody>
              {org.locations.map((loc) => {
                const row = locationSettingsRow(loc.id);
                const eff = effectiveLocationConfig(loc.id, demo);
                const overridden =
                  !eff.currencyInherited ||
                  !eff.timezoneInherited ||
                  !eff.closeInherited;
                return (
                  <tr
                    key={loc.id}
                    data-location-row={loc.id}
                    data-active={selectedId === loc.id ? "true" : undefined}
                    onClick={() => setSelectedId(loc.id)}
                  >
                    <td>
                      <strong>{loc.displayName}</strong>
                    </td>
                    <td>
                      {loc.city}, {loc.country}
                    </td>
                    <td>{loc.vertical === "hotel" ? "Hotel" : "Restaurant"}</td>
                    <td>{row?.hours ?? "—"}</td>
                    <td>
                      <span
                        className="se-pill"
                        data-tone={overridden ? "override" : "inherit"}
                      >
                        {overridden ? "Overridden" : "Inherited"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {selected && effective ? (
        <aside className="se-panel se-detail" data-location-detail={selected.id}>
          <header className="se-panel-head">
            <div>
              <h2>{selected.displayName}</h2>
              <p>
                {selected.city}, {selected.country} ·{" "}
                {meta?.ownership ?? "Owned"} · {meta?.systems ?? "—"}
              </p>
            </div>
          </header>

          <p className="se-detail-note">
            {meta?.overrides ?? "Uses organization defaults unless overridden."}
          </p>

          <div className="se-form se-form-stack">
            <div className="se-field">
              <label htmlFor="loc-currency">Currency</label>
              <small>
                {effective.currencyInherited
                  ? `Inherited from organization (${demo.currency})`
                  : "Location override"}
              </small>
              <div className="se-field-row">
                <select
                  id="loc-currency"
                  value={
                    demo.locationOverrides[selected.id]?.currency ?? ""
                  }
                  data-testid="loc-currency"
                  onChange={(e) =>
                    setOverride({
                      currency: e.target.value || null,
                    })
                  }
                >
                  <option value="">Organization default</option>
                  {CURRENCY_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {!effective.currencyInherited ? (
                  <button
                    type="button"
                    className="se-btn-ghost"
                    onClick={() => resetField("currency")}
                  >
                    Reset
                  </button>
                ) : null}
              </div>
            </div>

            <div className="se-field">
              <label htmlFor="loc-tz">Timezone</label>
              <small>
                {effective.timezoneInherited
                  ? `Inherited (${demo.timezone})`
                  : "Location override"}
              </small>
              <div className="se-field-row">
                <select
                  id="loc-tz"
                  value={demo.locationOverrides[selected.id]?.timezone ?? ""}
                  data-testid="loc-timezone"
                  onChange={(e) =>
                    setOverride({ timezone: e.target.value || null })
                  }
                >
                  <option value="">Organization default</option>
                  {TIMEZONE_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {!effective.timezoneInherited ? (
                  <button
                    type="button"
                    className="se-btn-ghost"
                    onClick={() => resetField("timezone")}
                  >
                    Reset
                  </button>
                ) : null}
              </div>
            </div>

            <div className="se-field">
              <label htmlFor="loc-close">Service close</label>
              <small>
                {effective.closeInherited
                  ? "Inherited / venue default"
                  : "Location override"}
              </small>
              <div className="se-field-row">
                <input
                  id="loc-close"
                  type="time"
                  value={
                    demo.locationOverrides[selected.id]?.closeClock ??
                    effective.closeClock ??
                    ""
                  }
                  data-testid="loc-close"
                  onChange={(e) =>
                    setOverride({ closeClock: e.target.value || null })
                  }
                />
                {!effective.closeInherited ? (
                  <button
                    type="button"
                    className="se-btn-ghost"
                    onClick={() => resetField("closeClock")}
                  >
                    Reset
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
