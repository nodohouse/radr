import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { DecisionTrace } from "@/components/marketing/decision/DecisionTrace";
import { getDecisionTrace } from "@/lib/marketing/decisionTrace";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const displayId = decodeURIComponent(id).toUpperCase();
  const trace = getDecisionTrace(displayId);
  if (!trace) {
    return { title: "Decision Trace — RADR" };
  }
  return {
    title: `${trace.displayId} Trace — RADR`,
    description: trace.whySurfaced,
    alternates: buildAlternatesForLocale(
      locale,
      `/product/decisions/${trace.displayId}/trace`,
    ),
  };
}

export function generateStaticParams() {
  return [{ id: "D-4102" }, { id: "D-4188" }];
}

export default async function DecisionTracePage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const displayId = decodeURIComponent(id).toUpperCase();
  const trace = getDecisionTrace(displayId);
  if (!trace) notFound();

  return (
    <div className="radr radr-mineral">
      <SiteNav />
      <main>
        <section className="rx-page-hero rx-page-hero--mineral" data-nav-theme="light">
          <div className="rx-shell rx-page-hero-inner">
            <p className="rx-kicker">Decision Trace · DEMO</p>
            <h1 className="rx-page-title">
              {trace.displayId}
              <br />
              RADR shows its work.
            </h1>
            <p className="rx-lead rx-lead-short">
              Structured evidence, calculation, baseline, Futures, action, and
              verification — not hidden chain-of-thought.
            </p>
            <p className="rx-he-ctas" style={{ marginTop: "1rem" }}>
              <Link href="/security" className="rx-btn rx-btn-ghost">
                Trust
              </Link>
              <Link href="/product/value" className="rx-btn rx-btn-ghost">
                Verified Value
              </Link>
              <Link href="/#decision-trace-d4102" className="rx-btn rx-btn-ghost">
                Homepage recovery
              </Link>
            </p>
          </div>
        </section>

        <section className="rx-sec" data-nav-theme="light">
          <div className="rx-shell rx-sec-inner">
            <DecisionTrace trace={trace} documentMode />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
