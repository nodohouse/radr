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
        <p>
          Document storage accepts PDF, JPG/JPEG and PNG up to 15 MB per file,
          with at most 10 files per request. The onboarding analysis is a
          separate path: one UTF-8 contract or invoice CSV up to 1 MB. Both
          require a permitted workspace session.
        </p>
        <h3>Contract CSV</h3>
        <CodeBlock
          language="csv"
          code={`supplier,sku,unit,contract_rate,currency
Example Supplier,OLIVE-OIL,L,6.80,USD`}
        />
        <a href="/developers/contracts-example.csv" download>
          Download contract CSV ↓
        </a>
        <h3>Invoice CSV</h3>
        <CodeBlock
          language="csv"
          code={`supplier,invoice_id,sku,quantity,unit,unit_price,currency,invoice_date
Example Supplier,INV-EXAMPLE,OLIVE-OIL,420,L,7.45,USD,2026-10-30`}
        />
        <a href="/developers/invoices-example.csv" download>
          Download invoice CSV ↓
        </a>
        <p>{t("connectors.contractRecommended")}</p>
        <p className="rx-dev-fine">
          Use decimal points without thousands separators. Each row needs an
          explicit unit and three-letter currency code. Invalid rows are
          rejected; data is not silently partially analyzed. Downloaded rows are
          synthetic examples.
        </p>
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
