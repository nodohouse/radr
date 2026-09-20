"use client";

import { useTranslations } from "next-intl";

const STEPS = [
  "connect",
  "understand",
  "discover",
  "predict",
  "simulate",
  "decide",
  "act",
  "verify",
  "learn",
] as const;

/**
 * Nine-step RADR loop: CONNECT → LEARN.
 */
export function SectionLoop() {
  const t = useTranslations("homepage.loop");

  return (
    <section
      className="rx-ed-section rx-ed-loop"
      data-nav-theme="light"
      id="loop"
    >
      <div className="rx-shell">
        <header className="rx-ed-head">
          <p className="rx-kicker">{t("kicker")}</p>
          <h2 className="rx-display">{t("title")}</h2>
          <p className="rx-lead">{t("lead")}</p>
        </header>

        <ol className="rx-ed-loop-steps" aria-label={t("aria")}>
          {STEPS.map((id, i) => (
            <li key={id}>
              <span className="rx-ed-loop-n">
                {String(i + 1).padStart(2, "0")}
              </span>
              <strong>{t(`steps.${id}.label`)}</strong>
              <span>{t(`steps.${id}.detail`)}</span>
            </li>
          ))}
        </ol>

        <p className="rx-ed-restraint">{t("close")}</p>
      </div>
    </section>
  );
}
