import { INGEST_CHANNELS } from "@/components/marketing/config/architecture";
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
    title: t("connections.title"),
    description: t("connections.lead"),
    alternates: buildAlternatesForLocale(locale, "/product/connections"),
  };
}

export default async function ConnectionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("product.connections");

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
            <div className="rx-conn-wrap">
              <table className="rx-conn-table">
                <thead>
                  <tr>
                    <th>{t("colChannel")}</th>
                    <th>{t("colCovers")}</th>
                    <th>{t("colStatus")}</th>
                  </tr>
                </thead>
                <tbody>
                  {INGEST_CHANNELS.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{t(`channels.${c.id}.title`)}</strong>
                      </td>
                      <td>{t(`channels.${c.id}.body`)}</td>
                      <td>
                        <span className="rx-conn-status">
                          {t(`status.${c.status}`)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="rx-home-linkrow" style={{ marginTop: "1.5rem" }}>
              <Link href="/developers">{t("developersLink")}</Link>
              {" · "}
              <Link href="/product">{t("howLink")}</Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
