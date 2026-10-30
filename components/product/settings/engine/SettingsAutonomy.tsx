"use client";

import { useState } from "react";
import type {
  AutonomyLadder,
  DemoSettingsState,
} from "@/lib/radr/product/demoSettings";

type Props = {
  demo: DemoSettingsState;
  onPatch: (partial: Partial<DemoSettingsState>) => void;
  isHotel: boolean;
};

type Operator = {
  id: string;
  name: string;
  level: string;
  prepared: number;
  approved: number;
  declined: number;
  actionKeys: string[];
  hotelOnly?: boolean;
};

const OPERATORS: Operator[] = [
  {
    id: "service",
    name: "SERVICE OPERATOR",
    level: "Prepare + request approval",
    prepared: 14,
    approved: 11,
    declined: 3,
    actionKeys: ["delivery", "reservations", "table_release"],
  },
  {
    id: "kitchen",
    name: "KITCHEN OPERATOR",
    level: "Prepare",
    prepared: 9,
    approved: 8,
    declined: 1,
    actionKeys: ["procurement"],
  },
  {
    id: "guest",
    name: "GUEST OPERATOR",
    level: "Recommend + request approval",
    prepared: 6,
    approved: 5,
    declined: 1,
    actionKeys: ["recommend"],
  },
  {
    id: "finance",
    name: "FINANCE OPERATOR",
    level: "Observe / explain",
    prepared: 4,
    approved: 4,
    declined: 0,
    actionKeys: ["supplier_disputes"],
  },
  {
    id: "procurement",
    name: "PROCUREMENT OPERATOR",
    level: "Prepare + request approval",
    prepared: 7,
    approved: 5,
    declined: 2,
    actionKeys: ["procurement", "supplier_disputes"],
  },
  {
    id: "workforce",
    name: "WORKFORCE OPERATOR",
    level: "Prepare",
    prepared: 5,
    approved: 4,
    declined: 1,
    actionKeys: ["scheduling"],
  },
  {
    id: "hotel_ops",
    name: "HOTEL OPERATIONS OPERATOR",
    level: "Prepare",
    prepared: 8,
    approved: 7,
    declined: 1,
    actionKeys: ["scheduling"],
    hotelOnly: true,
  },
];

const LEVELS: { id: AutonomyLadder; label: string }[] = [
  { id: "observe", label: "L0 Observe" },
  { id: "recommend", label: "L1–2 Explain / Recommend" },
  { id: "prepare", label: "L2 Prepare" },
  { id: "approve", label: "L3 Request approval" },
  { id: "auto", label: "L4 Execute within policy" },
];

export function SettingsAutonomy({ demo, onPatch, isHotel }: Props) {
  const ops = OPERATORS.filter((o) => (o.hotelOnly ? isHotel : true));
  const [selectedId, setSelectedId] = useState(ops[0]?.id ?? "service");
  const selected = ops.find((o) => o.id === selectedId) ?? ops[0]!;

  const setClass = (key: string, level: AutonomyLadder) => {
    if (level === "auto") {
      const ok = window.confirm(
        `Increase autonomy to EXECUTE WITHIN POLICY for “${key}”?\n\nThis may allow RADR to execute qualifying actions without individual approval.`,
      );
      if (!ok) return;
    }
    onPatch({
      autonomyByClass: { ...demo.autonomyByClass, [key]: level },
    });
  };

  return (
    <div className="se-split" data-settings-autonomy="true">
      <section className="se-panel">
        <header className="se-panel-head">
          <div>
            <h2>Autonomy</h2>
            <p>
              RADR Operators — functional identities, not cartoon workers. Levels
              are action-specific and gated by policy, confidence, and Data
              Health.
            </p>
          </div>
        </header>

        <div className="se-callout" style={{ marginTop: 0, marginBottom: 14 }}>
          <strong>Operator status</strong>
          <p>
            {ops.length} operators · 0 fully autonomous ·{" "}
            {ops.filter((o) => o.level.includes("Prepare")).length} prepare /
            approval · Forecast no-auto below {demo.forecastNoAutoBelow}% · 2
            actions blocked by low Data Health (demo).
          </p>
        </div>

        <div className="se-op-grid">
          {ops.map((o) => (
            <button
              key={o.id}
              type="button"
              className="se-op-card"
              data-operator={o.id}
              data-active={selectedId === o.id ? "true" : undefined}
              onClick={() => setSelectedId(o.id)}
            >
              <strong>{o.name}</strong>
              <span>{o.level}</span>
              <em>
                {o.prepared} prepared · {o.approved} approved · {o.declined}{" "}
                declined
              </em>
            </button>
          ))}
        </div>
      </section>

      <aside className="se-panel se-detail" data-operator-detail={selected.id}>
        <header className="se-panel-head">
          <div>
            <h2>{selected.name}</h2>
            <p>{selected.level} · last 30 days</p>
          </div>
        </header>

        <p className="se-detail-note">
          Pause operator or raise levels only with confirmation. Level 5 global
          autonomy is not offered.
        </p>

        <div className="se-form se-form-stack">
          {selected.actionKeys.map((key) => (
            <div className="se-field" key={key}>
              <label htmlFor={`auto-${key}`}>{key.replace(/_/g, " ")}</label>
              <small>Action-class autonomy</small>
              <select
                id={`auto-${key}`}
                value={demo.autonomyByClass[key] ?? "prepare"}
                data-testid={`autonomy-${key}`}
                onChange={(e) =>
                  setClass(key, e.target.value as AutonomyLadder)
                }
              >
                {LEVELS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="se-demo-foot" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="se-btn-secondary"
            data-testid="pause-operator"
            onClick={() => {
              window.alert(
                `${selected.name} paused for this demo session (no execute).`,
              );
            }}
          >
            Pause operator
          </button>
        </div>
      </aside>
    </div>
  );
}
