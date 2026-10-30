import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PublicFooter, PublicNavbar } from "@/components/marketing/PublicShell";
import { DISCLAIMER } from "@/lib/marketing/value-calculator";
import { buildAlternatesForLocale } from "@/i18n/seo";
import "@/app/marketing-2030.css";
import "@/app/value-calculator.css";
import "@/app/brand-takeover.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Value Calculator methodology | RADR",
    description:
      "Inputs, assumptions, overlap protection, confidence, capture rate, and ROI for the RADR Value Opportunity Calculator.",
    alternates: buildAlternatesForLocale(
      locale,
      "/value-calculator/methodology",
    ),
  };
}

export default async function ValueCalculatorMethodologyPage({
  params,
}: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="radr radr-mineral">
      <PublicNavbar />
      <main className="rx30 rx30--mockup">
        <section className="vc-method">
          <div className="rx30-shell">
            <article>
              <p className="rx30-kicker">Methodology</p>
              <h1 className="rx30-h1">Value Calculator methodology</h1>
              <p className="rx30-lead">{DISCLAIMER}</p>

              <h2>What it estimates</h2>
              <p>
                Where value may be leaking, which areas matter, a modeled annual
                range worth investigating, evidence required, capture scenarios,
                and illustrative ROI only when investment is supplied.
              </p>

              <h2>Inputs</h2>
              <p>
                Vertical, locations, annual revenue, currency, optional operating
                metrics, pain areas, and maturity. Any advanced field may be
                marked “I don’t know” and is then labeled ASSUMED.
              </p>

              <h2>Assumptions</h2>
              <p>
                Rates live in a central registry (
                <code>lib/marketing/value-calculator/assumptions.ts</code>
                ). Prefer internal modeling assumptions — not invented industry
                benchmarks. See{" "}
                <Link href="/value-calculator">How was this calculated?</Link>{" "}
                in the calculator for live assumption IDs.
              </p>

              <h2>Overlap protection</h2>
              <p>
                Categories in the same overlap group are not summed blindly.
                Primary keeps full weight; others are scaled by a correlation
                factor. A portfolio cap limits total modeled value vs revenue.
              </p>

              <h2>Confidence</h2>
              <p>
                Derived from how many inputs are known vs assumed, specificity,
                and maturity — not “AI confidence.”
              </p>

              <h2>Capture rate & ROI</h2>
              <p>
                Default capture is conservative (20%). ROI and payback appear
                only when annual investment is entered. Label: Illustrative ROI.
              </p>

              <h2>Expected ≠ Verified</h2>
              <p>
                Calculator Verified Value is always $0 until real operational
                evidence seals an outcome in the product.
              </p>

              <h2>Limitations</h2>
              <p>
                Not financial advice. Not a promise. Currency is reporting
                currency as entered — no FX conversion in V1. Client-side
                calculation by default.
              </p>

              <p>
                Full model:{" "}
                <code>docs/VALUE_CALCULATOR_MODEL.md</code>
              </p>

              <Link href="/value-calculator" className="rx30-btn rx30-btn-primary">
                Back to Value Calculator <span aria-hidden="true">→</span>
              </Link>
            </article>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
