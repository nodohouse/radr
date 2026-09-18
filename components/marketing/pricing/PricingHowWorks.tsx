import { getTranslations } from "next-intl/server";
import { pricingDimensions } from "./config";

export async function PricingHowWorks() {
  const t = await getTranslations("pricing");

  return (
    <section className="px-how" data-nav-theme="light" id="how">
      <div className="rx-shell">
        <header className="px-section-head px-section-head--center">
          <p className="rx-kicker">{t("how.kicker")}</p>
          <h2 className="px-section-title">{t("how.title")}</h2>
          <p className="px-section-lead">{t("how.lead")}</p>
        </header>
        <ol className="px-how-grid">
          {pricingDimensions.map((dim) => (
            <li key={dim.id} className="px-how-card">
              <p className="rx-kicker">{t(`dimensions.${dim.id}.title`)}</p>
              <p className="px-how-body">{t(`dimensions.${dim.id}.body`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
