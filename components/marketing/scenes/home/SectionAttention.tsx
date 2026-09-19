"use client";

import { useTranslations } from "next-intl";

const STATES = [
  { id: "ask", tone: "ask" as const },
  { id: "handling", tone: "handling" as const },
  { id: "watching", tone: "watching" as const },
  { id: "silence", tone: "silence" as const },
] as const;

/**
 * Attention returned — classification, not another compression funnel.
 * Stack already showed 57→2. This scene only adds: what happens to human attention.
 */
export function SectionAttention() {
  const t = useTranslations("homepage.attention");

  return (
    <section
      className="rx-scene rx-scene-attention"
      data-mode="compress"
      data-nav-theme="dark"
      id="attention"
    >
      <div className="rx-shell rx-attn-layout">
        <div className="rx-attn-copy">
          <h2 className="rx-attn-title">{t("title")}</h2>
          <p className="rx-attn-lead">{t("lead")}</p>
        </div>

        <ul className="rx-attn-states" aria-label={t("aria")}>
          {STATES.map((row) => (
            <li key={row.id} data-tone={row.tone}>
              <strong>{t(`states.${row.id}.value`)}</strong>
              <div>
                <span className="rx-attn-state-label">
                  {t(`states.${row.id}.label`)}
                </span>
                <span className="rx-attn-state-note">
                  {t(`states.${row.id}.note`)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
