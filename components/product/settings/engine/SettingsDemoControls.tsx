"use client";

import type { RoleView } from "@/lib/product/types";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import {
  DEMO_PERSONA_CHIPS_HOTEL,
  DEMO_PERSONA_CHIPS_RESTAURANT,
} from "@/lib/radr/product/settingsProofEngine";
import { personaFromRoleView } from "@/lib/radr/product/personas";

type Props = {
  vertical: DemoVerticalFamily;
  roleView: RoleView;
  onPersona: (role: RoleView) => void;
  onReset: () => void;
};

export function SettingsDemoControls({
  vertical,
  roleView,
  onPersona,
  onReset,
}: Props) {
  const chips =
    vertical === "hotel"
      ? DEMO_PERSONA_CHIPS_HOTEL
      : DEMO_PERSONA_CHIPS_RESTAURANT;
  const activeId = personaFromRoleView(roleView, vertical);

  return (
    <section className="se-demo" data-settings-demo="true" aria-label="Demo controls">
      <header className="se-demo-head">
        <h3>Demo controls</h3>
        <p>
          Persona changes the lens — not production access. Signed-in user ≠
          persona lens. Demo mode does not affect production data.
        </p>
      </header>

      <div className="se-persona-row" role="list">
        {chips.map((c) => (
          <button
            key={c.personaId}
            type="button"
            role="listitem"
            className="se-persona"
            data-persona={c.personaId}
            data-active={activeId === c.personaId ? "true" : undefined}
            aria-pressed={activeId === c.personaId}
            onClick={() => onPersona(c.roleView as RoleView)}
          >
            <strong>{c.title}</strong>
            <span>{c.subtitle}</span>
            <i aria-hidden>✓</i>
          </button>
        ))}
      </div>

      <div className="se-demo-foot">
        <button
          type="button"
          className="se-btn-secondary"
          data-testid="reset-demo-config"
          onClick={() => {
            if (
              window.confirm(
                "Reset demo persona and configuration?\n\nThis resets demo settings only — not production.",
              )
            ) {
              onReset();
            }
          }}
        >
          Reset demo configuration
        </button>
        <div className="se-demo-note">
          Demo controls change product perspective only. Your actual permissions
          and production settings remain unchanged. Reset returns demo settings
          to default.
        </div>
      </div>
    </section>
  );
}
