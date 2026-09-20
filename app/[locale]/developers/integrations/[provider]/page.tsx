import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/developers/CodeBlock";
import { DevelopersShell } from "@/components/developers/DevelopersShell";
import { Link } from "@/i18n/navigation";
import { buildAlternatesForLocale } from "@/i18n/seo";
import {
  getProvider,
  INTEGRATION_PROVIDERS,
  integrationTypeOf,
} from "@/lib/integrations/registry";
import {
  accessStatusLabel,
  capabilityStoryFor,
} from "@/lib/integrations/capabilityStory";
import {
  AUTH_METHOD_LABEL,
  accessRequirement,
  codeGuideStatus,
  dataMappings,
  envPlaceholders,
  formatReviewed,
  showMissingOfficialDocs,
  syncSummary,
} from "@/lib/integrations/providerDetails";
import { TextSep } from "@/components/TextSep";

type Props = { params: Promise<{ locale: string; provider: string }> };

export function generateStaticParams() {
  return INTEGRATION_PROVIDERS.map((p) => ({ provider: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, provider: id } = await params;
  const t = await getTranslations({ locale, namespace: "developers" });
  const p = getProvider(id);
  if (!p) {
    return {
      title: t("provider.fallbackTitle"),
      alternates: buildAlternatesForLocale(
        locale,
        `/developers/integrations/${id}`,
      ),
    };
  }
  return {
    title: `${p.name} · Developers`,
    description: `${p.name} · ${t(`labels.category.${p.category}`)} · ${t(`labels.status.${p.status}`)}`,
    alternates: buildAlternatesForLocale(
      locale,
      `/developers/integrations/${p.id}`,
    ),
  };
}

export default async function ProviderDetailPage({ params }: Props) {
  const { locale, provider: id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("developers");
  const p = getProvider(id);
  if (!p) notFound();

  const codeStatus = codeGuideStatus(p);
  const kind = integrationTypeOf(p);
  const env = envPlaceholders(p).join("\n");
  const story = capabilityStoryFor(p.id);
  const statusLabel =
    p.status === "custom"
      ? t("labels.status.custom")
      : t(`labels.status.${p.status}`);

  return (
    <DevelopersShell activeHref="/developers#integrations">
      <p className="rx-dev-crumb">
        <Link href="/developers#integrations">{t("provider.crumb")}</Link>
        <span aria-hidden> / </span>
        {p.name}
      </p>

      <header className="rx-dev-page-hero">
        <p className="rx-kicker">{t(`labels.category.${p.category}`)}</p>
        <h1 className="rx-page-title">{p.name}</h1>
        <div className="rx-dev-meta">
          <div>
            <em>{t("provider.status")}</em>
            <TextSep srOnly>: </TextSep>
            <strong>
              <span className="rx-dev-status" data-status={p.status}>
                {statusLabel}
              </span>
            </strong>
            <p className="rx-dev-fine" style={{ marginTop: "0.35rem" }}>
              Access: {accessStatusLabel(p)} · potential signals ≠ live receipt
            </p>
          </div>
          <div>
            <em>{t("provider.accessType")}</em>
            <TextSep srOnly>: </TextSep>
            <strong>{p.accessType.split("_").join(" ")}</strong>
          </div>
          <div>
            <em>{t("provider.lastReviewed")}</em>
            <TextSep srOnly>: </TextSep>
            <strong>{formatReviewed(p.lastReviewed)}</strong>
          </div>
          <div>
            <em>{t("provider.regions")}</em>
            <TextSep srOnly>: </TextSep>
            <strong>
              {p.regions.map((r, i) => (
                <span key={r}>
                  {i > 0 ? <TextSep /> : null}
                  {t(`labels.region.${r}`)}
                </span>
              ))}
            </strong>
          </div>
        </div>
        {p.docsUrl ? (
          <p className="rx-dev-official">
            {kind === "FILE_UPLOAD" || kind === "RADR_REFERENCE"
              ? t("provider.internalDocs")
              : t("provider.officialDocs")}{" "}
            {p.docsUrl.startsWith("http") ? (
              <a href={p.docsUrl} target="_blank" rel="noreferrer">
                {p.docsUrl.replace(/^https?:\/\//, "")}
              </a>
            ) : (
              <Link href={p.docsUrl}>{p.docsUrl}</Link>
            )}
          </p>
        ) : showMissingOfficialDocs(p) ? (
          <p className="rx-dev-fine">{t("provider.noDocs")}</p>
        ) : null}
      </header>

      <section className="rx-dev-block">
        <h2>{t("provider.accessTitle")}</h2>
        <p>{accessRequirement(p)}</p>
      </section>

      {story ? (
        <section className="rx-dev-block">
          <h2>Potential signals</h2>
          <p className="rx-dev-fine">
            Fields an authorized connection could expose — not a claim that RADR
            currently receives them. Endpoints and scopes: to be confirmed.
          </p>
          <ul className="rx-dev-bullets">
            {story.potentialSignals.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p style={{ marginTop: "0.75rem" }}>
            <strong>Combine with:</strong> {story.combineWith}
          </p>
          <ul className="rx-dev-bullets" style={{ marginTop: "0.5rem" }}>
            {story.radrCouldSee.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rx-dev-block">
        <h2>{t("provider.ingestTitle")}</h2>
        <ul className="rx-dev-card-ents rx-dev-ents-lg">
          {p.dataEntities.map((e) => (
            <li key={e}>{t(`labels.entity.${e}`)}</li>
          ))}
        </ul>
        <p className="rx-dev-fine">
          {p.status === "available"
            ? t("provider.ingestFineAvailable")
            : t("provider.ingestFine")}
        </p>
      </section>

      <section className="rx-dev-block">
        <h2>{t("provider.authTitle")}</h2>
        <ul className="rx-dev-bullets">
          {p.authMethods.map((m) => (
            <li key={m}>{AUTH_METHOD_LABEL[m]}</li>
          ))}
        </ul>
        <CodeBlock language="env" code={env} />
        <p className="rx-dev-fine">{t("provider.authFine")}</p>
      </section>

      <section className="rx-dev-block">
        <h2>{t("provider.mappingTitle")}</h2>
        <div className="rx-dev-table-wrap">
          <table className="rx-dev-table">
            <thead>
              <tr>
                <th>{t("provider.colProvider")}</th>
                <th>{t("provider.colRadr")}</th>
              </tr>
            </thead>
            <tbody>
              {dataMappings(p).map((row) => (
                <tr key={row.from}>
                  <td>{row.from}</td>
                  <td>{row.to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rx-dev-block">
        <h2>{t("provider.syncTitle")}</h2>
        <ul className="rx-dev-bullets">
          {syncSummary(p).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {kind === "THIRD_PARTY_API" ? (
          <p className="rx-dev-fine">{t("provider.syncFine")}</p>
        ) : null}
      </section>

      <section className="rx-dev-block">
        <h2>{t("provider.implTitle")}</h2>
        {codeStatus === "demo" ? (
          <>
            <p>{t("provider.implDemoBody")}</p>
            <CodeBlock
              language="typescript"
              code={`import { DemoReservationAdapter } from "@/lib/integrations/demo/DemoReservationAdapter";
import { normalizeExternalReservation } from "@/lib/integrations/normalize/reservation";

const adapter = new DemoReservationAdapter();
const ctx = { tenantId: "org_demo", connectionId: "conn_demo" };
const { reservations } = await adapter.syncReservations(ctx);
const radr = normalizeExternalReservation(
  reservations[0]!,
  ctx.connectionId,
  adapter.providerId,
);`}
            />
          </>
        ) : codeStatus === "available" ? (
          <>
            <p>{t("provider.implAvailable")}</p>
            {p.notes ? <p className="rx-dev-fine">{p.notes}</p> : null}
          </>
        ) : codeStatus === "custom" ? (
          <p>{t("provider.implCustom")}</p>
        ) : codeStatus === "planned" ? (
          <p>{t("provider.implPlanned")}</p>
        ) : (
          <p>{t("provider.implPending")}</p>
        )}
      </section>

      {p.notes ? (
        <section className="rx-dev-block">
          <h2>{t("provider.notesTitle")}</h2>
          <p>{p.notes}</p>
        </section>
      ) : null}

      <p className="rx-home-linkrow">
        <Link href="/developers#integrations">{t("provider.allIntegrations")}</Link>
        <TextSep />
        <Link href="/developers/connectors">{t("provider.buildConnector")}</Link>
      </p>
    </DevelopersShell>
  );
}
