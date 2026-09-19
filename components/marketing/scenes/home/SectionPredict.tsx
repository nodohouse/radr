"use client";

import { useTranslations } from "next-intl";

const CASES = ["restaurant", "hotel", "apartment"] as const;

/**
 * Not just what happened. What happens next.
 */
export function SectionPredict() {
  const t = useTranslations("homepage.predict");

  return (
    <section
      className="rx-ed-section rx-ed-predict"
      data-nav-theme="light"
      id="predict"
    >
      <div className="rx-shell">
        <header className="rx-ed-head rx-ed-head-wide">
          <p className="rx-kicker">{t("kicker")}</p>
          <h2 className="rx-display rx-display-lg">
            <span className="rx-ed-predict-line">{t("titleLine1")}</span>
            <span className="rx-ed-predict-line">{t("titleLine2")}</span>
          </h2>
          <p className="rx-lead">{t("lead")}</p>
        </header>

        <ul className="rx-ed-predict-grid" aria-label={t("aria")}>
          {CASES.map((id) => (
            <li key={id}>
              <p className="rx-ed-predict-vert">{t(`cases.${id}.vertical`)}</p>
              <h3>{t(`cases.${id}.headline`)}</h3>
              <p className="rx-ed-predict-estimate">{t(`cases.${id}.estimate`)}</p>
              <dl>
                <div>
                  <dt>{t("rangeLabel")}</dt>
                  <dd>{t(`cases.${id}.range`)}</dd>
                </div>
                <div>
                  <dt>{t("confidenceLabel")}</dt>
                  <dd>{t(`cases.${id}.confidence`)}</dd>
                </div>
                <div data-why="true">
                  <dt>{t("whyLabel")}</dt>
                  <dd>{t(`cases.${id}.why`)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
