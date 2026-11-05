import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { ProviderMark } from "@/components/developers/ProviderMark";
import { Link } from "@/i18n/navigation";
import { buildAlternatesForLocale } from "@/i18n/seo";
import {
  INTEGRATION_PROVIDERS,
  integrationTypeOf,
} from "@/lib/integrations/registry";
import "@/components/developers/developers-premium.css";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Connections and integration availability · RADR",
    description:
      "Current file intake, the local reference adapter and documented provider integration status.",
    alternates: buildAlternatesForLocale(locale, "/product/connections"),
  };
}
export default async function ConnectionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const available = INTEGRATION_PROVIDERS.filter(
    (p) => p.status === "available",
  );
  const commercial = available.filter(
    (p) => integrationTypeOf(p) === "THIRD_PARTY_API",
  );
  return (
    <div className="radr radr-mineral">
      <SiteNav />
      <main className="rc-page">
        <section className="rc-hero" data-nav-theme="light">
          <div>
            <p className="rc-eyebrow">
              CONNECTIONS / EVIDENCE IN, DECISIONS OUT
            </p>
            <h1>
              Connect evidence.
              <br />
              <em>Keep the proof.</em>
            </h1>
            <p>
              Start with the intake paths that exist. Understand the source,
              permissions and evidence quality before calling anything
              connected.
            </p>
            <div className="rm-ctas">
              <Link className="rm-button" href="/developers#integrations">
                Explore integration status →
              </Link>
              <Link
                className="rm-button rm-button-secondary"
                href="/developers/quickstart"
              >
                Run the local reference →
              </Link>
            </div>
          </div>
          <aside
            className="rc-status-board"
            aria-label="Integration availability"
          >
            <p>AVAILABILITY, WITHOUT THE GUESSWORK</p>
            <div>
              <strong>{available.length.toString().padStart(2, "0")}</strong>
              <span>
                Available intake / reference paths
                <small>File upload and a local synthetic adapter.</small>
              </span>
            </div>
            <div>
              <strong>{commercial.length.toString().padStart(2, "0")}</strong>
              <span>
                Commercial adapters marked available
                <small>
                  Provider API access does not establish a RADR connection.
                </small>
              </span>
            </div>
            <div>
              <strong>{INTEGRATION_PROVIDERS.length}</strong>
              <span>
                Catalog entries
                <small>Each with its own status and documented scope.</small>
              </span>
            </div>
          </aside>
        </section>
        <section className="rc-section">
          <p className="rc-eyebrow">01 / START WITH WHAT WORKS</p>
          <h2>Two concrete paths. Clear boundaries.</h2>
          <div className="rc-paths">
            {available.map((p) => (
              <article key={p.id}>
                <div className="rc-path-head">
                  <ProviderMark id={p.id} name={p.name} size={34} />
                  <span>
                    AVAILABLE ·{" "}
                    {p.id === "files-csv"
                      ? "AUTHENTICATED WORKSPACE"
                      : "LOCAL REFERENCE"}
                  </span>
                </div>
                <h3>{p.name}</h3>
                <p>{p.notes}</p>
                <Link href={`/developers/integrations/${p.id}`}>
                  Read scope and implementation →
                </Link>
              </article>
            ))}
          </div>
        </section>
        <section className="rc-section">
          <p className="rc-eyebrow">02 / FILE INTAKE</p>
          <h2>The right format for the right job.</h2>
          <div className="rc-paths">
            <article>
              <span className="rc-tag">DOCUMENT STORAGE</span>
              <h3>PDF, JPEG and PNG.</h3>
              <p>
                Application validation allows up to 15 MB per file and 10 files
                per request. Files are stored as uploaded documents. Storage
                alone does not establish extraction, a Decision, or Verified
                Value.
              </p>
              <Link href="/developers/api#implemented-uploads">
                Read authenticated upload routes →
              </Link>
            </article>
            <article>
              <span className="rc-tag">ONBOARDING ANALYSIS</span>
              <h3>Contract and invoice CSV.</h3>
              <p>
                UTF-8 CSV up to 1 MB, with explicit unit and currency columns.
                Use the supplied schemas. XLSX and arbitrary operating CSV
                mappings are not supported in this path.
              </p>
              <Link href="/developers/connectors#csv">
                Get validated sample schemas →
              </Link>
            </article>
          </div>
          <p className="rc-fine">
            An authorized workspace and deployment configuration are required.
            Hosting request limits may be lower than application limits. Demo
            access does not grant an authenticated upload session.
          </p>
        </section>
        <section className="rc-section">
          <p className="rc-eyebrow">03 / BEFORE A PROVIDER GOES LIVE</p>
          <h2>Connection is a state you can prove.</h2>
          <div className="rc-checks">
            {[
              {
                n: "01",
                title: "Authorize the source",
                body: "Confirm provider approval, credentials, entity scope and workspace ownership.",
              },
              {
                n: "02",
                title: "Validate the evidence",
                body: "Check source IDs, timestamps, currency, unit and completeness. Keep provenance attached.",
              },
              {
                n: "03",
                title: "Verify actual receipt",
                body: "A provider logo, API listing or access agreement is not a successful sync. Check received records and health.",
              },
            ].map((x) => (
              <article key={x.n}>
                <span>{x.n}</span>
                <h3>{x.title}</h3>
                <p>{x.body}</p>
              </article>
            ))}
          </div>
          <div className="rm-ctas">
            <Link href="/developers" className="rm-button">
              Open developer documentation →
            </Link>
            <Link href="/security" className="rm-button rm-button-secondary">
              Trust and security →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
