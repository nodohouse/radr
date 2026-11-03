import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { ReportCover } from "@/components/marketing/reports/ReportPromo";
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
            Turn fragmented operating signals into decisions your team can
            inspect, approve, and learn from.
          </p>
          <div className="rr-report-meta">
            <span>{report.pages} pages</span>
            <span>English PDF</span>
            <span>Practical field guide</span>
          </div>
          <ReportCover />
          <section className="rr-contents">
            <h2>Inside the report</h2>
            <ul>
              <li>The decision loop: from evidence to a verified outcome.</li>
              <li>
                Restaurant capacity, hotel readiness, and the CFO forecast
                briefing.
              </li>
              <li>A recovery evidence checklist finance can reconcile.</li>
              <li>A 30-day pilot plan and a reusable decision worksheet.</li>
            </ul>
            <p>
              Written by RADR Editorial. First-party operating framework with
              clearly labeled synthetic examples.
            </p>
          </section>
        </div>
        <div id="request-report">
          <ReportLeadForm available={reportDeliveryReady()} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
