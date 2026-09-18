"use client";

import { useTranslations } from "next-intl";

/**
 * RADR can say WAIT · RADR can disagree.
 */
export function SectionJudgment() {
  const t = useTranslations("homepage.judgment");

  return (
    <section
      className="rx-ed-section rx-ed-judgment"
      data-nav-theme="light"
      id="judgment"
    >
      <div className="rx-shell">
        <header className="rx-ed-head">
          <p className="rx-kicker">{t("kicker")}</p>
          <h2 className="rx-display">{t("title")}</h2>
          <p className="rx-lead">{t("lead")}</p>
        </header>

        <div className="rx-ed-judgment-grid" aria-label={t("aria")}>
          <article className="rx-ed-judgment-panel" data-kind="wait">
            <p className="rx-ed-judgment-k">{t("wait.kicker")}</p>
            <h3>{t("wait.title")}</h3>
            <dl>
              <div>
                <dt>{t("wait.confidenceLabel")}</dt>
                <dd>{t("wait.confidence")}</dd>
              </div>
              <div>
                <dt>{t("wait.deadlineLabel")}</dt>
                <dd>{t("wait.deadline")}</dd>
              </div>
              <div>
                <dt>{t("wait.dataLabel")}</dt>
                <dd>{t("wait.data")}</dd>
              </div>
            </dl>
            <p className="rx-ed-judgment-rec">
              <strong>{t("wait.rec")}</strong>
              <span>{t("wait.why")}</span>
            </p>
          </article>

          <article className="rx-ed-judgment-panel" data-kind="disagree">
            <p className="rx-ed-judgment-k">{t("disagree.kicker")}</p>
            <h3>{t("disagree.title")}</h3>
            <dl>
              <div>
                <dt>{t("disagree.intuitionLabel")}</dt>
                <dd>{t("disagree.intuition")}</dd>
              </div>
              <div>
                <dt>{t("disagree.costLabel")}</dt>
                <dd>{t("disagree.cost")}</dd>
              </div>
              <div>
                <dt>{t("disagree.protectLabel")}</dt>
                <dd>{t("disagree.protect")}</dd>
              </div>
              <div data-net="true">
                <dt>{t("disagree.netLabel")}</dt>
                <dd>{t("disagree.net")}</dd>
              </div>
            </dl>
            <p className="rx-ed-judgment-rec">
              <strong>{t("disagree.rec")}</strong>
              <span>{t("disagree.why")}</span>
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
