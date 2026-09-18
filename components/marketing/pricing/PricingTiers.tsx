import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pricingConfig } from "./config";

export async function PricingTiers() {
  const t = await getTranslations("pricing");
  const coreFeatures = t.raw("core.features") as string[];
  const controlFeatures = t.raw("control.features") as string[];

  return (
    <section className="px-tiers" id="plans" data-nav-theme="light">
      <div className="rx-shell">
        <div className="px-tier-grid" data-count="2">
          <article className="px-tier" data-tier="core" data-commercial="true">
            <header className="px-tier-head">
              <div className="px-tier-title-row">
                <p className="rx-kicker">{t("core.name")}</p>
                <span className="px-tier-desig">{t("core.verb")}</span>
              </div>
              <p className="px-tier-line">{t("core.line")}</p>
              <p className="px-tier-audience">{t("core.audience")}</p>
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
                className="rx-btn rx-btn-primary"
              >
                {t("core.cta")} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>

          <article className="px-tier" data-tier="control" data-depth="true">
            <header className="px-tier-head">
              <div className="px-tier-title-row">
                <p className="rx-kicker">{t("control.name")}</p>
                <span className="px-tier-desig">{t("control.verb")}</span>
              </div>
              <p className="px-tier-line">{t("control.line")}</p>
              <p className="px-tier-audience">{t("control.audience")}</p>
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

        <div className="px-enterprise">
          <p className="rx-kicker">{t("enterprise.kicker")}</p>
          <p className="px-enterprise-body">{t("enterprise.body")}</p>
          <Link
            href={pricingConfig.talkHref}
            className="rx-btn rx-btn-ghost px-enterprise-cta"
          >
            {t("enterprise.cta")} <span aria-hidden="true">→</span>
          </Link>
        </div>

        <p className="px-pricing-note">{t("packagesNote")}</p>
      </div>
    </section>
  );
}
