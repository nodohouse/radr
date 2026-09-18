import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "company" });
  return {
    title: t("customers.metaTitle"),
    description: t("customers.metaDescription"),
    alternates: buildAlternatesForLocale(locale, "/customers"),
  };
}

export default async function CustomersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("company");

  return (
    <div className="radr radr-mineral">
      <SiteNav />
      <main>
        <section className="rx-page-hero rx-page-hero--mineral" data-nav-theme="light">
          <div className="rx-shell rx-page-hero-inner">
            <p className="rx-kicker">{t("customers.kicker")}</p>
            <h1 className="rx-page-title">
              {t("customers.heroLine1")}
              <br />
              {t("customers.heroLine2")}
              <br />
              {t("customers.heroLine3")}
            </h1>
            <p className="rx-lead rx-lead-short">
              {t("customers.heroLead")}
            </p>
            <div className="rx-ctas" style={{ marginTop: "1.75rem" }}>
              <Link href="/contact" className="rx-btn rx-btn-primary">
                {t("customers.ctaTalk")}
              </Link>
              <Link href="/product" className="rx-btn rx-btn-ghost">
                {t("customers.ctaProduct")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
