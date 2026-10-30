"use client";

import type { DemoSettingsState } from "@/lib/radr/product/demoSettings";

type Props = {
  demo: DemoSettingsState;
  onPatch: (partial: Partial<DemoSettingsState>) => void;
};

export function SettingsNotifications({ demo, onPatch }: Props) {
  const rows: {
    key: keyof DemoSettingsState;
    title: string;
    blurb: string;
  }[] = [
    {
      key: "notifyNeedsYouEmail",
      title: "Needs you · email",
      blurb: "Material Decisions waiting on judgment.",
    },
    {
      key: "notifyApprovalEmail",
      title: "Approvals · email",
      blurb: "When your approval is requested or escalated.",
    },
    {
      key: "notifyVerifiedInApp",
      title: "Verified Value · in-app",
      blurb: "When outcomes seal into the ledger.",
    },
    {
      key: "quietHoursEnabled",
      title: "Quiet hours 22:00–07:00",
      blurb: "Critical overrides still interrupt (safety · material exposure).",
    },
  ];

  return (
    <section className="se-panel" data-settings-notifications="true">
      <header className="se-panel-head">
        <div>
          <h2>Notifications</h2>
          <p>
            Channels, quiet hours, and briefings. No marketing-style noise —
            operating interruptions only.
          </p>
        </div>
      </header>

      <div>
        {rows.map((r) => {
          const on = Boolean(demo[r.key]);
          return (
            <div className="se-toggle-row" key={r.key}>
              <div>
                <strong>{r.title}</strong>
                <span>{r.blurb}</span>
              </div>
              <button
                type="button"
                className="se-toggle"
                data-on={on ? "true" : undefined}
                data-testid={`notify-${r.key}`}
                aria-pressed={on}
                onClick={() => onPatch({ [r.key]: !on })}
              />
            </div>
          );
        })}
      </div>

      <h3 className="se-subhead">Briefings</h3>
      <div className="se-form" style={{ marginTop: 8 }}>
        <div className="se-field">
          <label>CFO</label>
          <small>Weekday morning executive brief.</small>
          <input readOnly value="08:00 weekdays" />
        </div>
        <div className="se-field">
          <label>GM</label>
          <small>Pre-service operating brief.</small>
          <input readOnly value="2h before dinner" />
        </div>
        <div className="se-field">
          <label>Head Chef</label>
          <small>Prep + stock brief.</small>
          <input readOnly value="90m before service" />
        </div>
      </div>
    </section>
  );
}
