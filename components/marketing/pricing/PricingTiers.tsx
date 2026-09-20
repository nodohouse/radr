import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pricingConfig } from "./config";

/**
 * One commercial hierarchy: Start · Expand · Enterprise.
 * Appears exactly once on the pricing page.
 */
export async function PricingTiers() {
  const t = await getTranslations("pricing");
  const coreFeatures = t.raw("core.features") as string[];
  const controlFeatures = t.raw("control.features") as string[];
  const pilotPoints = t.raw("pilot.points") as string[];

  return (
    <section className="px-tiers" id="plans" data-nav-theme="light">
      <div className="rx-shell">
        <div className="px-tier-grid" data-count="3" data-progression="true">
          <article className="px-tier" data-tier="pilot" data-step="recover">
            <header className="px-tier-head">
              <div className="px-tier-title-row">
                <p className="rx-kicker">Start</p>
                <span className="px-tier-desig">{t("pilot.verb")}</span>
              </div>
              <h2 className="px-tier-line">{t("pilot.title")}</h2>
              <p className="px-tier-audience">{t("pilot.body")}</p>
            </header>
            <div className="px-tier-price-block">
              <p className="px-tier-price-label">{t("pilot.priceLabel")}</p>
              <p className="px-pilot-price-sub">{t("pilot.priceSub")}</p>
            </div>
            <ul className="px-tier-list">
              {pilotPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="px-tier-foot">
              <Link
                href={pricingConfig.pilot.cta.href}
                className="rx-btn rx-btn-primary"
              >
                {t("pilot.cta")} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>

          <article
            className="px-tier"
            data-tier="core"
            data-step="decide"
            data-commercial="true"
          >
            <header className="px-tier-head">
              <div className="px-tier-title-row">
                <p className="rx-kicker">Expand</p>
                <span className="px-tier-desig">{t("core.verb")}</span>
              </div>
              <h2 className="px-tier-line">RADR</h2>
              <p className="px-tier-audience">{t("core.line")}</p>
            </header>
            <div className="px-tier-price-block">
              <p className="px-tier-price-label">{t("core.priceLabel")}</p>
            </div>
            <ul className="px-tier-list">
              {coreFeatures.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="px-tier-foot">
              <Link
                href={pricingConfig.core.cta.href}
                className="rx-btn rx-btn-ghost"
              >
                {t("core.cta")} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>

          <article
            className="px-tier"
            data-tier="control"
            data-step="govern"
            data-depth="true"
          >
            <header className="px-tier-head">
              <div className="px-tier-title-row">
                <p className="rx-kicker">Enterprise</p>
                <span className="px-tier-desig">{t("control.verb")}</span>
              </div>
              <h2 className="px-tier-line">RADR at group scale</h2>
              <p className="px-tier-audience">{t("control.line")}</p>
            </header>
            <div className="px-tier-price-block">
              <p className="px-tier-price-label">{t("control.priceLabel")}</p>
            </div>
            <ul className="px-tier-list">
              {controlFeatures.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="px-tier-foot">
              <Link
                href={pricingConfig.control.cta.href}
                className="rx-btn rx-btn-ghost"
              >
                {t("control.cta")} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        </div>

        <p className="px-pricing-note">{t("packagesNote")}</p>
      </div>
    </section>
  );
}
