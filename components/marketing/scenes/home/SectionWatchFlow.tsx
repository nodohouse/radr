"use client";

import { useTranslations } from "next-intl";

const DIMENSIONS = [
  "demand",
  "capacity",
  "labor",
  "guests",
  "money",
  "channels",
  "time",
] as const;

const CASCADE = ["rain", "terrace", "covers", "bar", "staff", "delivery", "risk"] as const;

/**
 * Operating Model — live model + rain cascade example.
 */
export function SectionWatchFlow() {
  const t = useTranslations("homepage.watch");

  return (
    <section className="rx-ed-section rx-ed-watch" data-nav-theme="light" id="watch">
      <div className="rx-shell">
        <header className="rx-ed-head">
          <p className="rx-kicker">{t("kicker")}</p>
          <h2 className="rx-display">{t("title")}</h2>
          <p className="rx-lead">{t("lead")}</p>
        </header>

        <ul className="rx-ed-twin-dims" aria-label={t("dimsAria")}>
          {DIMENSIONS.map((d) => (
            <li key={d}>{t(`dims.${d}`)}</li>
          ))}
        </ul>

        <div className="rx-ed-cascade" aria-label={t("cascadeAria")}>
          <p className="rx-ed-cascade-k">{t("cascadeLabel")}</p>
          <ol>
            {CASCADE.map((id, i) => (
              <li key={id}>
                <span className="rx-ed-flow-n">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{t(`cascade.${id}`)}</span>
              </li>
            ))}
          </ol>
          <p className="rx-ed-restraint">{t("close")}</p>
        </div>
      </div>
    </section>
  );
}
