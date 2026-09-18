import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

const VALUE_KEYS = ["identified", "protected", "verified"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "company" });
  return {
    title: t("approach.metaTitle"),
    description: t("approach.metaDescription"),
    alternates: buildAlternatesForLocale(locale, "/approach"),
  };
}

export default async function ApproachPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("company");

  const principles = t.raw("approach.principles") as Array<{
    n: string;
    title: string;
    body: string;
  }>;

  return (
    <div className="radr radr-mineral">
      <SiteNav />
      <main>
        <section className="rx-page-hero rx-page-hero--mineral" data-nav-theme="light">
          <div className="rx-shell rx-page-hero-inner">
            <p className="rx-kicker">{t("approach.kicker")}</p>
            <h1 className="rx-page-title">
              {t("approach.heroLine1")}
              <br />
              {t("approach.heroLine2")}
            </h1>
            <p className="rx-lead rx-lead-short">{t("approach.heroLead")}</p>
          </div>
        </section>

        <section className="rx-co-section" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-kicker">{t("approach.principlesKicker")}</p>
            <ol className="rx-co-beliefs">
              {principles.map((p) => (
                <li key={p.n}>
                  <span>{p.n}</span>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rx-co-section" id="value" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-kicker">{t("approach.valueKicker")}</p>
            <h2 className="rx-display rx-display-sm">
              {t("approach.valueTitleLine1")}
              <br />
              {t("approach.valueTitleLine2")}
            </h2>
            <ul className="rx-approach-value">
              {VALUE_KEYS.map((key) => (
                <li key={key}>
                  <strong>{t(`approach.valueStates.${key}.label`)}</strong>
                  <span>{t(`approach.valueStates.${key}.desc`)}</span>
                </li>
              ))}
            </ul>
            <div className="rx-ctas" style={{ marginTop: "2rem" }}>
              <Link href="/why" className="rx-btn rx-btn-ghost">
                {t("approach.ctaWhy")}
              </Link>
              <Link href="/product" className="rx-btn rx-btn-primary">
                {t("approach.ctaHow")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
