import {
  ENTITY_ALIASES,
  ENTITY_CANONICAL,
  OPERATING_MODEL_ENTITIES,
} from "@/components/marketing/config/architecture";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { Link } from "@/i18n/navigation";
import { buildAlternatesForLocale } from "@/i18n/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "product" });
  return {
    title: t("operatingModel.title"),
    description: t("operatingModel.lead"),
    alternates: buildAlternatesForLocale(locale, "/product/operating-model"),
  };
}

export default async function OperatingModelPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("product.operatingModel");

  return (
    <div className="radr radr-mineral">
      <SiteNav />
      <main>
        <section className="rx-page-hero rx-page-hero--mineral" data-nav-theme="light">
          <div className="rx-shell rx-page-hero-inner">
            <p className="rx-kicker">{t("kicker")}</p>
            <h1 className="rx-page-title">{t("title")}</h1>
            <p className="rx-lead rx-lead-short">{t("lead")}</p>
          </div>
        </section>

        <section className="rx-home-sec" data-nav-theme="light">
          <div className="rx-shell">
            <h2 className="rx-display rx-display-sm">{t("entitiesTitle")}</h2>
            <ul className="rx-model-entities">
              {OPERATING_MODEL_ENTITIES.map((e) => (
                <li key={e}>{t(`entities.${e}`)}</li>
              ))}
            </ul>

            <h2
              className="rx-display rx-display-sm"
              style={{ marginTop: "2.5rem" }}
            >
              {t("normTitle")}
            </h2>
            <p className="rx-lead">{t("normLead")}</p>
            <div className="rx-model-norm">
              <div>
                <em>{t("aliases")}</em>
                <ul>
                  {ENTITY_ALIASES.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
              <p className="rx-model-arrow" aria-hidden="true">
                →
              </p>
              <div>
                <em>{t("canonical")}</em>
                <strong>
                  {ENTITY_CANONICAL.supplier} · {ENTITY_CANONICAL.item}
                </strong>
              </div>
            </div>

            <p className="rx-home-linkrow" style={{ marginTop: "1.5rem" }}>
              <Link href="/product">{t("howLink")}</Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
