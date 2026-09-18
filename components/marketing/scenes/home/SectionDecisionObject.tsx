"use client";

import { useTranslations } from "next-intl";

const ANATOMY = [
  "what",
  "why",
  "nothing",
  "options",
  "recommend",
  "sure",
  "when",
  "after",
] as const;

/**
 * Visual Decision Object — WHAT / SO WHAT / NOW WHAT + anatomy.
 */
export function SectionDecisionObject() {
  const t = useTranslations("homepage.decisionObject");

  return (
    <section
      className="rx-ed-section rx-ed-decision"
      data-nav-theme="light"
      id="decision"
    >
      <div className="rx-shell">
        <header className="rx-ed-head">
          <p className="rx-kicker">{t("kicker")}</p>
          <h2 className="rx-display">{t("title")}</h2>
          <p className="rx-lead">{t("lead")}</p>
        </header>

        <ul className="rx-ed-dec-anatomy" aria-label={t("anatomyAria")}>
          {ANATOMY.map((id) => (
            <li key={id}>{t(`anatomy.${id}`)}</li>
          ))}
        </ul>

        <article className="rx-ed-dec-board" aria-label={t("aria")}>
          <p className="rx-ed-dec-terr">{t("territory")}</p>
          <h3 className="rx-ed-dec-what">{t("what")}</h3>
          <p className="rx-ed-dec-so">{t("soWhat")}</p>
          <p className="rx-ed-dec-money">
            <strong>{t("money")}</strong>
            <span>{t("moneyLabel")}</span>
          </p>
          <p className="rx-ed-dec-nothing">
            <em>{t("nothingLabel")}</em>
            <span>{t("nothing")}</span>
          </p>

          <div className="rx-ed-dec-plan">
            <p className="rx-ed-dec-plan-k">{t("planLabel")}</p>
            <ul>
              <li>{t("plan.1")}</li>
              <li>{t("plan.2")}</li>
              <li>{t("plan.3")}</li>
            </ul>
            <dl className="rx-ed-dec-meta">
              <div>
                <dt>{t("protectedLabel")}</dt>
                <dd>{t("protected")}</dd>
              </div>
              <div>
                <dt>{t("confidenceLabel")}</dt>
                <dd>{t("confidence")}</dd>
              </div>
              <div>
                <dt>{t("deadlineLabel")}</dt>
                <dd>{t("deadline")}</dd>
              </div>
            </dl>
            <button type="button" className="rx-btn rx-btn-primary" tabIndex={-1}>
              {t("approve")}
            </button>
          </div>

          <p className="rx-ed-dec-links">
            <span>{t("linkWhy")}</span>
            <span aria-hidden="true"> · </span>
            <span>{t("linkWhatIf")}</span>
            <span aria-hidden="true"> · </span>
            <span>{t("linkEvidence")}</span>
          </p>
        </article>
      </div>
    </section>
  );
}
