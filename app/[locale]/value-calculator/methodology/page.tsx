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
                Vertical, locations, annual revenue, currency, optional
                operating metrics, pain areas, and maturity. Any advanced field
                may be marked “I don’t know” and is then labeled ASSUMED.
              </p>

              <h2>Assumptions</h2>
              <p>
                Each operating area uses an explicit modeling assumption. Open
                How was this calculated? in your result to inspect the rates,
                inputs and source references. Assumptions are identified as
                such; they are not presented as measured customer results or
                industry benchmarks. You can adjust them to reflect your
                operation.
              </p>

              <h2>Overlap protection</h2>
              <p>
                One issue can affect several operating areas. The model reduces
                overlapping estimates so the same potential effect is not
                counted in full twice. It also limits the combined estimate
                relative to revenue.
              </p>

              <h2>Confidence</h2>
              <p>
                Derived from how many inputs are known vs assumed, specificity,
                and how well they describe your operation. This describes input
                quality, not a probability that savings will occur.
              </p>

              <h2>Capture rate & ROI</h2>
              <p>
                The default capture scenario is 20% of the modeled range. This
                is an adjustable assumption. Illustrative ROI and payback appear
                only when you supply an annual investment.
              </p>

              <h2>Expected ≠ Verified</h2>
              <p>
                A calculated estimate is not Verified Value. Verification
                requires operational evidence of an outcome in the product.
              </p>

              <h2>Limitations</h2>
              <p>
                Results are illustrative estimates, not financial advice or a
                promise of savings. Amounts stay in your selected reporting
                currency; the calculator does not convert exchange rates. A
                proper evaluation uses your own source records.
              </p>

              <p>
                Use Adjust assumptions in your results to review and change the
                model. Keep a copy of your inputs when comparing scenarios.
              </p>

              <Link
                href="/value-calculator"
                className="rx30-btn rx30-btn-primary"
              >
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
