"use client";

import type {
  ContextSignalMode,
  DemoSettingsState,
} from "@/lib/radr/product/demoSettings";

type Props = {
  demo: DemoSettingsState;
  onPatch: (partial: Partial<DemoSettingsState>) => void;
};

const MODES: { id: ContextSignalMode; label: string }[] = [
  { id: "enabled", label: "Enabled" },
  { id: "watching", label: "Watching" },
  { id: "off", label: "Off" },
];

const SIGNALS: {
  key: keyof Pick<
    DemoSettingsState,
    | "contextWeather"
    | "contextEvents"
    | "contextHolidays"
    | "contextSchoolHolidays"
  >;
  title: string;
  blurb: string;
}[] = [
  {
    key: "contextWeather",
    title: "Weather",
    blurb: "Influences covers, terrace, and demand confidence.",
  },
  {
    key: "contextEvents",
    title: "Local events",
    blurb: "Concerts, matches, and venue-driven demand spikes.",
  },
  {
    key: "contextHolidays",
    title: "Public holidays",
    blurb: "National and regional holiday calendars.",
  },
  {
    key: "contextSchoolHolidays",
    title: "School holidays",
    blurb: "Family demand windows — watching by default.",
  },
];

export function SettingsContextPanel({ demo, onPatch }: Props) {
  return (
    <section className="se-panel" data-settings-context="true">
      <header className="se-panel-head">
        <div>
          <h2>Context</h2>
          <p>
            External signals that shape how RADR interprets demand, calendars,
            and operating days. These feed forecasts — they do not write to
            systems of record.
          </p>
        </div>
      </header>

      <div className="se-signal-grid">
        {SIGNALS.map((s) => (
          <article key={s.key} className="se-signal" data-signal={s.key}>
            <div>
              <strong>{s.title}</strong>
              <p>{s.blurb}</p>
            </div>
            <div
              className="se-segment"
              role="group"
              aria-label={`${s.title} mode`}
            >
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  data-active={demo[s.key] === m.id ? "true" : undefined}
                  onClick={() => onPatch({ [s.key]: m.id })}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="se-form" style={{ marginTop: 18 }}>
        <div className="se-field">
          <label>Locale</label>
          <small>Reporting language and number formats.</small>
          <input value="de-DE · Germany" readOnly aria-readonly />
        </div>
        <div className="se-field">
          <label>Business calendar</label>
          <small>Aligns service periods with fiscal and local calendars.</small>
          <input value="Follow fiscal calendar + public holidays" readOnly />
        </div>
      </div>
    </section>
  );
}
