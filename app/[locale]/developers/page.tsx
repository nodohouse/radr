import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CodeBlock } from "@/components/developers/CodeBlock";
import { DevelopersLifecycleStrip } from "@/components/developers/DevelopersLifecycleStrip";
import { DevelopersShell } from "@/components/developers/DevelopersShell";
import { IntegrationsCatalog } from "@/components/developers/IntegrationsCatalog";
import { Link } from "@/i18n/navigation";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "developers" });
  return {
    title: t("hub.metaTitle"),
    description: t("hub.metaDescription"),
    alternates: buildAlternatesForLocale(locale, "/developers"),
  };
}

const ENTRY = [
  { n: "01", href: "/developers#integrations", key: "integrations" },
  { n: "02", href: "/developers/api", key: "api" },
  { n: "03", href: "/developers/webhooks", key: "webhooks" },
  { n: "04", href: "/developers/connectors", key: "build" },
] as const;

const FLOW_SOURCES = [
  "Mews",
  "Toast",
  "Guesty",
  "Personio",
  "NetSuite",
] as const;

export default async function DevelopersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("developers");

  const flowOut = t.raw("hub.flowOut") as string[];
  const quickstartSteps = t.raw("hub.quickstartSteps") as string[];
  const archBand = t.raw("hub.archBand") as Array<{ span: string; em: string }>;
  const securityBullets = t.raw("hub.securityBullets") as string[];

  const capabilityFamilies = t.raw("hub.capabilityFamilies") as Array<{
    vertical: string;
    systems: string;
    entities: string;
  }>;

  return (
    <DevelopersShell activeHref="/developers">
      <DevelopersLifecycleStrip />
      <header className="rx-dev-page-hero">
        <div className="rx-dev-hero-grid">
          <div className="rx-dev-hero-copy">
            <p className="rx-dev-badge" style={{ marginBottom: "0.75rem" }}>
              {t("badge.sandboxComing")}
            </p>
            <h1 className="rx-page-title rx-dev-hero-title">
              {t("heroTitleLine1")}
              <br />
              {t("heroTitleLine2")}
            </h1>
            <p className="rx-lead-inv rx-lead-short">{t("heroLead")}</p>
            <div className="rx-dev-cta">
              <Link className="rx-btn rx-btn-primary" href="/developers/quickstart">
                {t("getStarted")} <span aria-hidden>→</span>
              </Link>
              <Link className="rx-btn rx-btn-ghost" href="/developers/api">
                {t("apiReference")} <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          <aside className="rx-dev-flow-mini" aria-label={t("hub.flowAria")}>
            <div className="rx-dev-arch">
              <div className="rx-dev-arch-sources">
                {FLOW_SOURCES.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              <div className="rx-dev-arch-join" aria-hidden>
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="rx-dev-arch-core">RADR</div>
              <div className="rx-dev-arch-split" aria-hidden>
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="rx-dev-arch-out">
                {flowOut.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </div>
            <p className="rx-dev-fine">{t("hub.flowDecorNote")}</p>
          </aside>
        </div>
      </header>

      <nav className="rx-dev-entry" aria-label={t("hub.entryAria")}>
        {ENTRY.map((e) => (
          <Link key={e.href} href={e.href} className="rx-dev-entry-item">
            <span className="rx-dev-entry-n">{e.n}</span>
            <div className="rx-dev-entry-body">
              <strong>{t(`hub.entry.${e.key}.label`)}</strong>
              <span className="rx-dev-entry-meta">
                {t(`hub.entry.${e.key}.meta`)}
              </span>
              <span className="rx-dev-entry-desc">
                {t(`hub.entry.${e.key}.desc`)}
              </span>
            </div>
            <span className="rx-dev-entry-cta" aria-hidden>
              →
            </span>
          </Link>
        ))}
      </nav>

      <section className="rx-dev-quick-split" id="quickstart">
        <div className="rx-dev-quick-copy">
          <div className="rx-dev-block-head">
            <p className="rx-kicker">{t("hub.quickstartKicker")}</p>
            <span className="rx-dev-badge">{t("badge.sandboxComing")}</span>
          </div>
          <h2>{t("hub.quickstartTitle")}</h2>
          <ol className="rx-dev-steps rx-dev-steps-lg">
            {quickstartSteps.map((step) => (
              <li key={step}>
                <strong>{step}</strong>
              </li>
            ))}
          </ol>
          <p className="rx-dev-fine">{t("hub.quickstartFine")}</p>
          <Link className="rx-btn rx-btn-ghost" href="/developers/quickstart">
            {t("hub.startQuickstart")} <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="rx-dev-quick-code">
          <p className="rx-dev-proposed">{t("hub.proposedApi")}</p>
          <CodeBlock
            language="typescript"
            code={`const radr = new RADR({
  baseUrl: process.env.RADR_API_BASE_URL,
  apiKey: process.env.RADR_API_KEY,
})

// High-level typed SDK (Quickstart path)
await radr.reservations.create({
  location: "berlin-mitte",
  partySize: 4,
  serviceTime: "2026-08-24T20:00:00+02:00",
})
// maps onto generic: await radr.events.ingest({ type: "reservation.created", ... })`}
          />
          <p className="rx-dev-fine">{t("architecture.ingestNote")}</p>
        </div>
      </section>

      <section className="rx-dev-block" id="architecture">
        <h2>{t("architecture.findingTitle")}</h2>
        <p>{t("architecture.findingBody")}</p>
        <ol className="rx-dev-steps">
          {(t.raw("architecture.pipeline") as string[]).map((step) => (
            <li key={step}>
              <code>{step}</code>
            </li>
          ))}
        </ol>
      </section>

      <section className="rx-dev-band" aria-label={t("hub.archTitle")}>
        <div className="rx-dev-band-inner">
          <p className="rx-dev-band-kicker">{t("hub.archKicker")}</p>
          <h2 className="rx-dev-band-title">{t("hub.archTitle")}</h2>
          <div className="rx-dev-band-flow">
            <ul>
              {archBand.map((item) => (
                <li key={item.span}>
                  <span>{item.span}</span>
                  <em>{item.em}</em>
                </li>
              ))}
            </ul>
            <span className="rx-dev-band-arrow" aria-hidden>
              →
            </span>
            <p className="rx-dev-band-core">RADR</p>
          </div>
        </div>
      </section>

      <section className="rx-dev-block" id="integrations">
        <p className="rx-kicker">{t("hub.catalogKicker")}</p>
        <h2>{t("hub.catalogTitle")}</h2>
        <p className="rx-lead-inv rx-lead-short">{t("hub.catalogLead")}</p>
        <IntegrationsCatalog />
      </section>

      <section className="rx-dev-block" id="capability-families">
        <p className="rx-kicker">{t("hub.capabilityFamiliesKicker")}</p>
        <h2>{t("hub.capabilityFamiliesTitle")}</h2>
        <p className="rx-lead-inv rx-lead-short">{t("hub.capabilityFamiliesLead")}</p>
        <div className="rx-dev-table-wrap">
          <table className="rx-dev-table">
            <thead>
              <tr>
                <th>{t("hub.capabilityFamiliesKicker")}</th>
                <th>Systems</th>
                <th>Entity focus</th>
              </tr>
            </thead>
            <tbody>
              {capabilityFamilies.map((row) => (
                <tr key={row.vertical}>
                  <td>{row.vertical}</td>
                  <td>{row.systems}</td>
                  <td>{row.entities}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rx-dev-block" id="security">
        <p className="rx-kicker">{t("hub.securityKicker")}</p>
        <h2>{t("hub.securityTitle")}</h2>
        <ul className="rx-dev-bullets">
          {securityBullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <p className="rx-dev-fine">{t("hub.securityCert")}</p>
        <h3 className="rx-dev-h3">{t("hub.dataMinTitle")}</h3>
        <p>{t("hub.dataMinBody")}</p>
      </section>

      <section className="rx-dev-block" id="cant-find">
        <p className="rx-kicker">{t("hub.customKicker")}</p>
        <h2>{t("hub.customTitle")}</h2>
        <p className="rx-lead-inv rx-lead-short">{t("hub.customLead")}</p>
        <div className="rx-dev-cta">
          <Link className="rx-btn rx-btn-primary" href="/developers/connectors">
            {t("hub.buildConnector")} <span aria-hidden>→</span>
          </Link>
          <Link className="rx-btn rx-btn-ghost" href="/contact">
            {t("hub.sendDocs")} <span aria-hidden>→</span>
          </Link>
          <Link className="rx-btn rx-btn-ghost" href="/contact">
            {t("hub.talkRadr")} <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <section className="rx-dev-block">
        <p className="rx-kicker">{t("hub.previewKicker")}</p>
        <h2>{t("hub.previewTitle")}</h2>
        <CodeBlock
          language="bash"
          code={`curl https://api.example.invalid/v1/locations \\
  -H "Authorization: Bearer $RADR_API_KEY"`}
        />
        <p className="rx-dev-fine">{t("hub.previewFine")}</p>
        <Link href="/developers/api">{t("hub.fullApi")}</Link>
      </section>
    </DevelopersShell>
  );
}
