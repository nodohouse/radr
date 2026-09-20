import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { TRUST_CONTROLS } from "@/components/marketing/config/trust";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

const CATEGORIES = [
  "DATA",
  "ACCESS",
  "INFRASTRUCTURE",
  "APPLICATION",
  "DOCUMENTS",
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "company" });
  return {
    title: t("securityPage.metaTitle"),
    description: t("securityPage.metaDescription"),
    alternates: buildAlternatesForLocale(locale, "/security"),
  };
}

export default async function SecurityPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("company");

  return (
    <div className="radr radr-mineral">
      <SiteNav />
      <main>
        <section className="rx-page-hero rx-page-hero--mineral" data-nav-theme="light">
          <div className="rx-shell rx-page-hero-inner">
            <p className="rx-kicker">{t("securityPage.kicker")}</p>
            <h1 className="rx-page-title">
              {t("securityPage.heroLine1")}
              <br />
              {t("securityPage.heroLine2")}
            </h1>
            <p className="rx-lead rx-lead-short">
              {t("securityPage.heroLead")}
            </p>
          </div>
        </section>

        <section className="rx-sec rx-trust-stages" data-nav-theme="light">
          <div className="rx-shell rx-sec-inner">
            <p className="rx-kicker">{t("securityPage.stagesKicker")}</p>
            <h2 className="rx-display rx-display-sm">
              {t("securityPage.stagesTitle")}
            </h2>
            <ol className="rx-trust-stages-list">
              {(
                t.raw("securityPage.stages") as {
                  grade: string;
                  example: string;
                }[]
              ).map((s, i) => (
                <li key={s.grade}>
                  {i > 0 ? (
                    <span className="rx-trust-stages-arrow" aria-hidden="true">
                      ↓
                    </span>
                  ) : null}
                  <em>{s.grade}</em>
                  <strong>{s.example}</strong>
                </li>
              ))}
            </ol>
            <p className="rx-lead rx-lead-short rx-trust-model-note">
              {t("securityPage.modelNote")}
            </p>
          </div>
        </section>

        <section className="rx-sec rx-sec-trust" data-nav-theme="light">
          <div className="rx-shell rx-sec-inner">
            <p className="rx-kicker">{t("securityPage.trustKicker")}</p>
            <h2 className="rx-display rx-display-sm">{t("securityPage.trustTitle")}</h2>
            <p className="rx-lead rx-lead-short">{t("securityPage.trustLead")}</p>
            <ul className="rx-trust-list">
              {(
                t.raw("securityPage.trustPrinciples") as {
                  title: string;
                  detail: string;
                }[]
              ).map((item) => (
                <li key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
            <h2 className="rx-display rx-display-sm rx-trust-uncert-h">
              {t("securityPage.uncertaintyTitle")}
            </h2>
            <p className="rx-lead rx-lead-short">
              {t("securityPage.uncertaintyLead")}
            </p>
            <p className="rx-lead rx-lead-short">{t("securityPage.uncertaintyNote")}</p>
            <p className="rx-sec-note">{t("securityPage.opsNote")}</p>
          </div>
        </section>

        <section className="rx-sec" data-nav-theme="light">
          <div className="rx-shell rx-sec-inner">
            <p className="rx-kicker">{t("securityPage.controlsKicker")}</p>
            <h2 className="rx-display rx-display-sm">
              {t("securityPage.controlsTitle")}
            </h2>
            <p className="rx-lead rx-lead-short">
              {t("securityPage.controlsLead")}
            </p>
            {CATEGORIES.map((cat) => {
              const items = TRUST_CONTROLS.filter((c) => c.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} className="rx-sec-block">
                  <p className="rx-sec-cat">
                    {t(`securityPage.categories.${cat}`)}
                  </p>
                  <ul className="rx-sec-list">
                    {items.map((item) => (
                      <li key={item.id}>
                        <div className="rx-sec-row">
                          <h2>
                            {t(`securityPage.controls.${item.id}.label`)}
                          </h2>
                          <em data-status={item.status === "LIVE" ? "on" : "dev"}>
                            {item.status === "LIVE"
                              ? t("securityPage.status.LIVE")
                              : t("securityPage.status.IN_DEVELOPMENT")}
                          </em>
                        </div>
                        <p>{t(`securityPage.controls.${item.id}.detail`)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            <p className="rx-sec-note">{t("securityPage.certNote")}</p>
            <p className="rx-sec-note">
              {t("securityPage.questionsPrefix")}{" "}
              <Link href="/privacy">{t("securityPage.privacyLink")}</Link>
              {" · "}
              <Link href="/contact">{t("securityPage.contactLink")}</Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
