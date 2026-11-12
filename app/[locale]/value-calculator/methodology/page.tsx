import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PublicFooter, PublicNavbar } from "@/components/marketing/PublicShell";
import {
  CATEGORY_LABEL,
  OPPORTUNITY_ASSUMPTIONS,
  PORTFOLIO,
} from "@/lib/marketing/value-calculator";
import { buildAlternatesForLocale } from "@/i18n/seo";
import "@/app/marketing-2030.css";
import "@/app/brand-takeover.css";
import "@/app/marketing-premium-pages.css";
import "@/app/value-calculator-premium.css";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Value Calculator methodology | RADR",
    description:
      "Inspect RADR's value-model inputs, category rates, overlap adjustments, capture scenarios and optional budget calculations.",
    alternates: buildAlternatesForLocale(
      locale,
      "/value-calculator/methodology",
    ),
  };
}
export default async function Methodology({ params }: Props) {
  setRequestLocale((await params).locale);
  return (
    <div className="radr radr-mineral rm-premium vc3">
      <PublicNavbar />
      <main className="rx30 rx30--mockup vc3-page">
        <section className="vc3-workspace">
          <div className="rx30-shell">
            <article className="vc3-panel vc3-method-page">
              <span className="vc3-eyebrow">Value Calculator methodology</span>
              <h1>A model you can inspect.</h1>
              <p>
                The calculator builds an illustrative financial scenario. It
                does not inspect business records, identify a confirmed loss or
                verify an outcome.
              </p>
              <h2>1. Your financial base</h2>
              <p>
                Enter combined annual revenue for all selected locations, in the
                reporting currency you choose. An exact amount is used directly.
                A range uses its midpoint. Unknown revenue stays unknown: you
                can explore categories, but no monetary estimate or ROI is
                invented. Location count supplies context and does not multiply
                the combined revenue.
              </p>
              <p>
                Labor, purchasing, food cost, delivery share, room-revenue share
                and third-party booking mix set the relevant category bases.
                Unanswered metrics use stated model defaults. These inputs
                determine the monetary bases used by the model.
              </p>
              <h2>2. Category rates</h2>
              <p>
                The rates below are internal modeling assumptions, not
                research-backed hospitality loss rates or measured RADR customer
                results. Lower, central and higher describe scenarios, not
                statistical confidence intervals. Inspect a selected category’s
                annual base and multipliers in your result.
              </p>
              <div
                className="vc3-method-table"
                role="region"
                aria-label="Default modeling rates"
                tabIndex={0}
              >
                <table>
                  <caption>
                    Default category rates, applied to the relevant annual
                    revenue or spending base.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Operating area</th>
                      <th scope="col">Lower</th>
                      <th scope="col">Central</th>
                      <th scope="col">Higher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {OPPORTUNITY_ASSUMPTIONS.map((a) => (
                      <tr key={a.id}>
                        <th scope="row">{CATEGORY_LABEL[a.categoryId]}</th>
                        <td>{(a.rates.low * 100).toFixed(2)}%</td>
                        <td>{(a.rates.base * 100).toFixed(2)}%</td>
                        <td>{(a.rates.high * 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h2>3. Overlap and portfolio adjustments</h2>
              <p>
                Within a related-category group, the largest central amount is
                retained; secondary category amounts are multiplied by{" "}
                {PORTFOLIO.overlapCorrelationFactor * 100}%. If the adjusted
                central total exceeds {PORTFOLIO.portfolioCapRate * 100}% of
                revenue, all category scenarios are scaled down together. This
                limits the central case, not the higher-case percentage of
                revenue. These are model guardrails, not evidence that a
                particular loss rate is correct.
              </p>
              <p>
                All displayed category amounts have already been adjusted. They
                add to the displayed total. The calculation bridge separately
                lists the raw central amount, overlap reduction and portfolio
                reduction.
              </p>
              <h2>4. Input coverage and review context</h2>
              <p>
                Coverage counts the relevant financial inputs supplied versus
                defaults or unknowns. It is not a probability of savings.
                Self-reported reconciliation and record-process answers help
                frame the evidence review; they do not certify source quality or
                discount the exposure total.
              </p>
              <h2>5. Capture scenarios and time horizons</h2>
              <p>
                The default capture assumption is{" "}
                {PORTFOLIO.defaultCaptureRate * 100}%, adjustable from 5% to
                50%. Capture is modeled exposure multiplied by your chosen
                percentage. It is not a forecast of RADR performance. Monthly
                amounts are annual amounts divided by twelve, not a seasonal
                forecast. Amounts remain in the selected currency with no
                foreign-exchange conversion.
              </p>
              <h2>6. Your optional budget</h2>
              <p>
                ROI appears only when revenue and a positive annual budget are
                supplied. This is your own evaluation budget, not a RADR price;
                plan prices remain pending.
              </p>
              <p>
                Annual net return = annual modeled capture minus annual budget.
                ROI = annual net return divided by annual budget. Central
                payback in months = annual budget divided by central monthly
                capture. This assumes a steady capture rate and no
                implementation ramp-up. Negative results are shown.
              </p>
              <h2>7. Privacy and exports</h2>
              <p>
                Financial inputs are calculated in browser memory. The
                calculator does not upload them, store a financial profile or
                submit a sales lead. Optional consented navigation analytics
                contain step information, not the financial inputs. CSV
                downloads include annual values, inputs, evidence requirements
                and assumptions. Print/save creates a local browser copy.
                Example profiles remain labeled as illustrative, even when
                edited.
              </p>
              <h2>8. Verify before acting</h2>
              <p>
                Review comparable records and a stated baseline before deciding
                what can be recovered, protected or created. Verified value
                remains zero in this calculator because no operational outcome
                has been checked. An estimate is not financial advice or a
                promise of savings.
              </p>
              <Link className="vc3-btn vc3-btn--blue" href="/value-calculator">
                Build your Value Map →
              </Link>
            </article>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
