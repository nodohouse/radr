"use client";

import { useTranslations } from "next-intl";

/**
 * Your systems record. RADR decides.
 */
export function SectionDecisionLayer() {
  const t = useTranslations("homepage.decisionLayer");
  const steps = ["connect", "predict", "act", "verify"] as const;

  return (
    <section
      className="rx-ed-section rx-ed-layer"
      data-nav-theme="light"
      id="decision-layer"
    >
      <div className="rx-shell">
        <header className="rx-ed-head rx-ed-head-wide">
          <p className="rx-kicker">{t("kicker")}</p>
          <h2 className="rx-display rx-display-lg">{t("title")}</h2>
          <p className="rx-lead">{t("lead")}</p>
        </header>
        <ol className="rx-ed-layer-loop" aria-label={t("aria")}>
          {steps.map((s) => (
            <li key={s}>
              <strong>{t(`steps.${s}`)}</strong>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
