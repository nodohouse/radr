import type { Metadata } from "next";
import NextLink from "next/link";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { CANON_PEAK, FINDING_FUNNEL, money } from "@/data/demo";
import { CTAS } from "@/lib/marketing/brand";
import { buildAlternatesForLocale } from "@/i18n/seo";
import "../../../product-chapters.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Findings — RADR",
    description:
      "A Finding is not an alert. It is something RADR detected that may matter. Only material findings become Decisions.",
    alternates: buildAlternatesForLocale(locale, "/product/findings"),
  };
}

const FUNNEL = [
  { label: "Signals", value: FINDING_FUNNEL.signals.toLocaleString("en-US") },
  { label: "Anomalies", value: String(FINDING_FUNNEL.anomalies) },
  { label: "Findings", value: String(FINDING_FUNNEL.findings) },
  { label: "Decisions", value: String(FINDING_FUNNEL.decisions) },
] as const;

export default async function FindingsChapterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const d = CANON_PEAK;

  return (
    <div className="radr rx-ch rx-ch-light">
      <SiteNav />
      <main>
        <section className="rx-ch-hero" data-nav-theme="light">
          <div className="rx-shell rx-ch-hero-inner">
            <p className="rx-ch-kicker">Platform · Findings</p>
            <h1 className="rx-ch-title">RADR finds what deserves a decision.</h1>
            <p className="rx-ch-lead">
              A Finding is not an alert. It is something RADR detected that may
              matter. Only material findings become Decisions.
            </p>
            <div className="rx-ch-ctas">
              <NextLink href="/product/decisions" className="rx-btn rx-btn-primary">
                {CTAS.openTrace} <span aria-hidden="true">→</span>
              </NextLink>
              <Link href="/contact" className="rx-ch-cta-ghost">
                {CTAS.primarySales}
              </Link>
            </div>
          </div>
        </section>

        <section className="rx-ch-sec" data-nav-theme="light">
          <div className="rx-shell">
            <ol
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
                gap: "1rem",
                listStyle: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {FUNNEL.map((step, i) => (
                <li key={step.label}>
                  <p className="rx-plat-decision-phase">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <strong style={{ fontSize: "1.75rem", display: "block" }}>
                    {step.value}
                  </strong>
                  <span>{step.label}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rx-ch-sec" data-nav-theme="light">
          <div className="rx-shell">
            <article
              className="rx-plat-decision-card"
              style={{
                padding: "1.5rem",
                background: "#fff",
                border: "1px solid rgba(10,13,11,0.12)",
              }}
            >
              <p className="rx-plat-decision-phase">FINDING → {d.displayId}</p>
              <h2 className="rx-plat-decision-headline">{d.title}</h2>
              <dl
                style={{
                  display: "grid",
                  gap: "0.75rem",
                  marginTop: "1rem",
                }}
              >
                <div>
                  <dt>What changed</dt>
                  <dd>{d.problemLine.replace("\n", " ")}</dd>
                </div>
                <div>
                  <dt>Economic exposure</dt>
                  <dd>{money(d.exposureEuro)} · tonight</dd>
                </div>
                <div>
                  <dt>Evidence</dt>
                  <dd>
                    {d.evidence.map((e) => `${e.label} ${e.value}`).join(" · ")}
                  </dd>
                </div>
                <div>
                  <dt>Decision eligibility</dt>
                  <dd>Material · deadline {d.deadline} · → Decision</dd>
                </div>
              </dl>
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
