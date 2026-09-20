"use client";

import { useTranslations } from "next-intl";

const STEPS = ["t1", "t2", "t3", "t4", "t5"] as const;

/**
 * Verified Value — one receipt.
 * Prove the outcome. Remember what worked. Nothing else.
 */
export function SectionVerifyLearn() {
  const t = useTranslations("homepage.verifyLearn");

  return (
    <section
      className="rx-scene rx-scene-verify"
      data-mode="timeline"
      data-nav-theme="light"
      id="verify-learn"
    >
      <div className="rx-shell rx-verify">
        <header className="rx-verify-head">
          <p className="rx-verify-k">{t("kicker")}</p>
          <h2 className="rx-verify-title">{t("title")}</h2>
          <p className="rx-verify-lead">{t("lead")}</p>
        </header>

        <article className="rx-verify-receipt" aria-label={t("traceAria")}>
          <ol className="rx-verify-steps">
            {STEPS.map((id, i) => (
              <li key={id} data-final={i === STEPS.length - 1 ? "1" : undefined}>
                {t(`trace.${id}`)}
              </li>
            ))}
          </ol>

          <div className="rx-verify-proof">
            <p className="rx-verify-amount">
              <strong>{t("resultAmount")}</strong>
              <span>{t("resultLabel")}</span>
            </p>
            <p className="rx-verify-learn">
              <em>{t("learnKicker")}</em>
              {t("learnLine")}
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
