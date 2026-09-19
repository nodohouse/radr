"use client";

import { useTranslations } from "next-intl";

const ANATOMY = [
  "sources",
  "freshness",
  "sample",
  "drivers",
  "range",
  "confidence",
  "assumptions",
  "evidence",
  "outcome",
] as const;

const BASIS = ["thursdays", "pace", "weather", "event", "terrace"] as const;

/**
 * No black box — evidence anatomy for material decisions.
 */
export function SectionTrustEvidence() {
  const t = useTranslations("homepage.trustEvidence");

  return (
    <section
      className="rx-ed-section rx-ed-trust"
      data-nav-theme="light"
      id="trust-evidence"
    >
      <div className="rx-shell">
        <header className="rx-ed-head">
          <p className="rx-kicker">{t("kicker")}</p>
          <h2 className="rx-display">{t("title")}</h2>
          <p className="rx-lead">{t("lead")}</p>
        </header>

        <ul className="rx-ed-trust-anatomy" aria-label={t("anatomyAria")}>
          {ANATOMY.map((id) => (
            <li key={id}>{t(`anatomy.${id}`)}</li>
          ))}
        </ul>

        <article className="rx-ed-trust-example" aria-label={t("exampleAria")}>
          <p className="rx-ed-trust-why">{t("whyLabel")}</p>
          <h3>{t("claim")}</h3>
          <p className="rx-ed-trust-based">{t("basedOn")}</p>
          <ul className="rx-ed-trust-basis">
            {BASIS.map((id) => (
              <li key={id}>{t(`basis.${id}`)}</li>
            ))}
          </ul>
          <dl className="rx-ed-trust-meta">
            <div>
              <dt>{t("rangeLabel")}</dt>
              <dd>{t("range")}</dd>
            </div>
            <div>
              <dt>{t("confidenceLabel")}</dt>
              <dd>{t("confidence")}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  );
}
