"use client";

import { useTranslations } from "next-intl";
import {
  HOMEPAGE_DEMO,
  formatHomepageUsd,
  homepageWeatherOpportunity,
} from "@/components/marketing/data/homepageDemo";

/**
 * Prepared Action: Finding → recommendation → economics → approval.
 * Crisp light product surface (not ghost text on white).
 */
export function SectionAction() {
  const t = useTranslations("homepage.action");
  const demo = HOMEPAGE_DEMO;
  const sell = demo.findings.sell;
  const opp = homepageWeatherOpportunity();
  const w = sell.weather;

  return (
    <section className="rx-hact" data-nav-theme="light" id="action">
      <div className="rx-shell">
        <header className="rx-hact-head">
          <p className="rx-kicker">{t("kicker")}</p>
          <h2 className="rx-display">{t("title")}</h2>
          <p className="rx-lead">{t("lead")}</p>
        </header>

        <div className="rx-prod-stage">
          <div className="rx-prod-plate" aria-hidden="true" />
          <div className="rx-prod-board rx-hact-board">
            <div className="rx-prod-chrome">
              <span className="rx-prod-chrome-left">
                <i aria-hidden="true" />
                {t("chrome")}
              </span>
              <span className="rx-prod-chrome-right">
                {demo.locations.sell.label}
              </span>
            </div>

            <div className="rx-prod-body rx-hact-econ">
              <p className="rx-hact-finding">
                <span className="rx-hact-eyebrow">{t("findingLabel")}</span>
                <em>SELL</em>
                <strong>{sell.moneyLabel}</strong>
                <span>{sell.summary}</span>
              </p>

              <dl className="rx-hact-money">
                <div>
                  <dt>{t("gross")}</dt>
                  <dd>{formatHomepageUsd(opp.gross)}</dd>
                </div>
                <div>
                  <dt>{t("cost")}</dt>
                  <dd>{formatHomepageUsd(opp.laborCost)}</dd>
                </div>
                <div data-net="true">
                  <dt>{t("net")}</dt>
                  <dd>{formatHomepageUsd(opp.net)}</dd>
                </div>
              </dl>

              <p className="rx-hact-calc">{opp.calc}</p>
              <p className="rx-hact-calc">{opp.netCalc}</p>

              <div className="rx-hact-decision">
                <p className="rx-hact-rec">
                  <span>{t("recommendLabel")}</span>
                  <strong>{t("recommend")}</strong>
                </p>
                <button type="button" className="rx-hact-approve" tabIndex={-1}>
                  {t("approve")}
                </button>
              </div>

              <p className="rx-hact-outcome">{t("outcomeHint")}</p>

              <aside className="rx-hact-counter" aria-label={t("counterfactual")}>
                <p className="rx-hact-label">{t("counterfactual")}</p>
                <dl>
                  <div>
                    <dt>{t("expectedDemand")}</dt>
                    <dd>{w.expectedDemand}</dd>
                  </div>
                  <div>
                    <dt>{t("currentCapacity")}</dt>
                    <dd>{w.fohPlan}</dd>
                  </div>
                  <div>
                    <dt>{t("constrained")}</dt>
                    <dd>{opp.constrainedCovers}</dd>
                  </div>
                  <div data-risk="true">
                    <dt>{t("leftBehind")}</dt>
                    <dd>{formatHomepageUsd(opp.doNothingValue)}</dd>
                  </div>
                </dl>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
