import Image from "next/image";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PlaybookBook } from "@/components/marketing/reports/PlaybookBook";
import "@/components/marketing/reports/reports.css";
import { ReportLeadForm } from "@/components/marketing/reports/ReportLeadForm";
import { HOSPITALITY_REPORT as report } from "@/lib/marketing/report";
import { reportDeliveryReady } from "@/lib/marketing/reportGate";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "The Hospitality Decision Playbook | RADR",
  alternates: {
    canonical: "https://radrup.com/en/resources/hospitality-decision-playbook",
    languages: {
      en: "https://radrup.com/en/resources/hospitality-decision-playbook",
    },
  },
  description:
    "A practical field guide for hospitality CFOs and operators. Request the PDF with an evidence scorecard, decision record worksheet and 30-day pilot plan.",
};
export default async function ReportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="radr">
      <SiteNav />
      <main className="rr-page rx-shell">
        <div className="rr-report-copy">
          <p className="rm-eyebrow">RADR OPERATOR SERIES / NOVEMBER 2026</p>
          <h1>
            The Hospitality
            <br />
            <em>Decision Playbook.</em>
          </h1>
          <p className="rm-lead">
            A full restaurant or hotel can still have a margin problem.
            Understand where the pressure comes from, which decisions can still
            change the result, and how to build a case your finance team can
            defend.
          </p>
          <div className="rr-report-meta">
            <span>{report.pages} pages</span>
            <span>English PDF</span>
            <span>6 research sources</span>
          </div>
          <a className="rm-button rr-mobile-cta" href="#request-report">
            Get the playbook →
          </a>
          <PlaybookBook href="#request-report" />
          <section className="rr-contents">
            <p className="rm-eyebrow">READ THE PRESSURE. FIND YOUR RESPONSE.</p>
            <h2>Learn quickly. Leave with a plan.</h2>
            <ol className="rr-outcomes">
              <li>
                <b>Understand the economics.</b>
                <span>
                  Charts on food waste, restaurant margins, hotel costs, and
                  distribution. Every finding has a date, geography, and source.
                </span>
              </li>
              <li>
                <b>Connect the operating choices.</b>
                <span>
                  See how a bestseller can strain the kitchen, why room
                  readiness changes the next decision, and how expected value
                  differs from proof.
                </span>
              </li>
              <li>
                <b>Build your own case.</b>
                <span>
                  Use the contribution calculator, evidence scorecard, decision
                  worksheet, and 30-day pilot plan with your own team.
                </span>
              </li>
            </ol>
            <p>
              RADR Editorial · Sourced research, practical calculations and
              clearly labeled operating examples.
            </p>
          </section>
          <section
            className="rr-research-strip"
            aria-labelledby="report-research-title"
          >
            <div>
              <p className="rm-eyebrow">THE CONTEXT BEHIND THE DECISION</p>
              <h2 id="report-research-title">
                Big pressure.
                <br />
                Specific operating choices.
              </h2>
              <p>
                These measures describe different markets and periods. They are
                not additive or estimates of RADR returns.
              </p>
            </div>
            <article>
              <strong>28%</strong>
              <h3>of global consumer food waste came from food service.</h3>
              <p>2022 estimate, including inedible parts.</p>
              <a href="https://www.unep.org/en/news-and-stories/press-release/world-squanders-over-1-billion-meals-day-un-report">
                UNEP, 2024 ↗
              </a>
            </article>
            <article>
              <strong>2.8%</strong>
              <h3>median pre-tax income relative to restaurant sales.</h3>
              <p>U.S. full-service restaurants, 2024 survey data.</p>
              <a href="https://restaurant.org/research-and-media/research/restaurant-economic-insights/analysis-commentary/new-association-report-helps-operators-gauge-their-restaurant-performance/">
                National Restaurant Association, 2025 ↗
              </a>
            </article>
          </section>
          <section
            className="rr-spreads"
            aria-labelledby="report-preview-title"
          >
            <div className="rr-spreads-heading">
              <div>
                <p className="rm-eyebrow">ACTUAL PAGES. PRACTICAL TAKEAWAYS.</p>
                <h2 id="report-preview-title">A look inside the playbook.</h2>
              </div>
              <a href="#request-report" className="rm-button">
                Get the playbook →
              </a>
            </div>
            <div className="rr-preview-grid">
              <figure>
                <div>
                  <Image
                    src="/marketing/reports/playbook-research-preview.png"
                    alt="Research preview: labeled charts compare restaurant margins and hotel revenue versus cost growth, with source notes"
                    width={707}
                    height={1000}
                    sizes="(max-width: 700px) 90vw, 38vw"
                  />
                </div>
                <figcaption>
                  <b>See the economics clearly.</b>Research charts with direct
                  labels, context, and original sources.
                </figcaption>
              </figure>
              <figure>
                <div>
                  <Image
                    src="/marketing/reports/playbook-worksheet-preview.png"
                    alt="Preview: printable decision worksheet for an owner, baseline, alternatives, approval, and verified outcome"
                    width={707}
                    height={1000}
                    sizes="(max-width: 700px) 90vw, 38vw"
                  />
                </div>
                <figcaption>
                  <b>Turn understanding into a decision.</b>A reusable record to
                  take into your next operating review.
                </figcaption>
              </figure>
            </div>
          </section>
        </div>
        <aside id="request-report" aria-label="Get the playbook">
          <ReportLeadForm available={reportDeliveryReady()} />
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}
