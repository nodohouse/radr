import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CodeBlock } from "@/components/developers/CodeBlock";
import { DevelopersShell } from "@/components/developers/DevelopersShell";
import { Link } from "@/i18n/navigation";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "developers" });
  return {
    title: t("connectors.metaTitle"),
    description: t("connectors.metaDescription"),
    alternates: buildAlternatesForLocale(locale, "/developers/connectors"),
  };
}

export default async function DevelopersConnectorsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("developers");
  const paths = t.raw("connectors.paths") as string[];
  const needs = t.raw("connectors.needs") as string[];

  return (
    <DevelopersShell activeHref="/developers/connectors">
      <header className="rx-dev-page-hero">
        <p className="rx-kicker">{t("connectors.kicker")}</p>
        <h1 className="rx-page-title">{t("connectors.title")}</h1>
        <p className="rx-lead-inv rx-lead-short">{t("connectors.lead")}</p>
      </header>

      <section className="rx-dev-block">
        <h2>{t("connectors.pathsTitle")}</h2>
        <ul className="rx-dev-bullets">
          {paths.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      <section className="rx-dev-block">
        <h2>{t("connectors.needsTitle")}</h2>
        <ul className="rx-dev-bullets">
          {needs.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>

      <section className="rx-dev-block" id="csv">
        <h2>{t("connectors.contractTitle")}</h2>
        <p className="rx-dev-fine">
          Upload → schema mapping → validation → normalization → data-quality
          flags → operating state.
        </p>
        <CodeBlock
          language="json"
          code={`{
  "externalId": "res_123",
  "locationExternalId": "berlin-mitte",
  "serviceTime": "2026-08-24T20:00:00+02:00",
  "partySize": 4,
  "status": "confirmed",
  "sourceUpdatedAt": "2026-08-24T18:02:00+02:00"
}`}
        />
        <p>{t("connectors.contractRecommended")}</p>
        <CodeBlock
          language="csv"
          code={`location_external_id,business_date,revenue,covers,labor_cost,currency
berlin-mitte,2026-08-24,18420.00,142,4120.00,EUR`}
        />
      </section>

      <section className="rx-dev-block" id="warehouse">
        <h2>{t("connectors.warehouseTitle")}</h2>
        <p>{t("connectors.warehouseBody")}</p>
      </section>

      <section className="rx-dev-block">
        <h2>{t("connectors.adaptersTitle")}</h2>
        <p>{t("connectors.adaptersBody")}</p>
      </section>

      <div className="rx-dev-cta">
        <Link className="rx-btn rx-btn-primary" href="/contact">
          {t("connectors.sendDocs")} <span aria-hidden>→</span>
        </Link>
        <Link className="rx-btn rx-btn-ghost" href="/developers/api">
          {t("connectors.ingestPreview")} <span aria-hidden>→</span>
        </Link>
      </div>
    </DevelopersShell>
  );
}
