import { getTranslations } from "next-intl/server";
import { expansionSteps } from "./config";

export async function PricingExpansion() {
  const t = await getTranslations("pricing.expansion");

  return (
    <section className="px-expand" data-nav-theme="light" id="expansion">
      <div className="rx-shell">
        <header className="px-section-head px-section-head--center">
          <p className="rx-kicker">{t("kicker")}</p>
          <h2 className="px-section-title">{t("title")}</h2>
        </header>
        <ol className="px-expand-rail">
          {expansionSteps.map((step, i) => (
            <li key={step.id} className="px-expand-step">
              {i > 0 ? (
                <span className="px-expand-arrow" aria-hidden="true">
                  ↓
                </span>
              ) : null}
              <div className="px-expand-card">
                <p className="rx-kicker">{t(`steps.${step.id}.label`)}</p>
                <h3 className="px-expand-h">{t(`steps.${step.id}.title`)}</h3>
                <p className="px-expand-body">{t(`steps.${step.id}.body`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
