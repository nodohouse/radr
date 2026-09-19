import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pricingConfig } from "./config";

export async function PricingPilot() {
  const t = await getTranslations("pricing");
  const points = t.raw("pilot.points") as string[];

  return (
    <section className="px-pilot" data-nav-theme="light" id="pilot">
      <div className="rx-shell">
        <div className="px-pilot-panel">
          <div className="px-pilot-copy">
            <p className="rx-kicker">{t("pilot.kicker")}</p>
            <p className="px-pilot-verb">{t("pilot.verb")}</p>
            <h2 className="px-pilot-title">{t("pilot.title")}</h2>
            <p className="px-pilot-lead">{t("pilot.lead")}</p>
            <p className="px-pilot-body">{t("pilot.body")}</p>
            <ul className="px-pilot-points">
              {points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <aside className="px-pilot-aside">
            <p className="px-pilot-price">{t("pilot.priceLabel")}</p>
            <p className="px-pilot-price-sub">{t("pilot.priceSub")}</p>
            <Link
              href={pricingConfig.pilot.cta.href}
              className="rx-btn rx-btn-primary"
            >
              {t("pilot.cta")} <span aria-hidden="true">→</span>
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
