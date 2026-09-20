import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { buildAlternatesForLocale } from "@/i18n/seo";
import "../../home.css";

type Props = { params: Promise<{ locale: string }> };

const GROUPS = ["brand", "territories", "system"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "glossary" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternatesForLocale(locale, "/glossary"),
  };
}

export default async function GlossaryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("glossary");

  return (
    <div className="radr radr-home">
      <SiteNav />
      <main className="rx-res">
        <section className="rx-res-hero" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-kicker">{t("kicker")}</p>
            <h1 className="rx-display">{t("title")}</h1>
            <p className="rx-lead">{t("lead")}</p>
          </div>
        </section>

        <section className="rx-res-glossary" data-nav-theme="light">
          <div className="rx-shell">
            {GROUPS.map((group) => {
              const items = t.raw(`groups.${group}.items`) as Record<
                string,
                { term: string; def: string }
              >;
              return (
                <div key={group} className="rx-res-g-group">
                  <h2 className="rx-res-g-title">{t(`groups.${group}.title`)}</h2>
                  <dl className="rx-res-g-list">
                    {Object.entries(items).map(([key, item]) => (
                      <div key={key} className="rx-res-g-item">
                        <dt>{item.term}</dt>
                        <dd>{item.def}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
