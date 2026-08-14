import Link from "next/link";
import { SiteFooter } from "../SiteFooter";
import { SiteNav } from "../SiteNav";
import { TRUST_CONTROLS } from "../config/trust";
import { SectionFinal } from "../scenes/SectionFinal";

const SYSTEMS = [
  "Procurement",
  "Finance",
  "Operations",
  "Labor",
  "Revenue",
  "Payments",
  "Delivery",
  "Accounting",
] as const;

const GAPS = [
  "supplier overcharge",
  "staffing mismatch",
  "missed credit",
  "pricing opportunity",
] as const;

const BELIEFS = [
  {
    n: "01",
    title: "The small things aren't small.",
    body: "€3.60 on one case looks irrelevant. Across thousands of transactions it isn't.",
  },
  {
    n: "02",
    title: "Show the money.",
    body: "Every finding should have a financial impact.",
  },
  {
    n: "03",
    title: "Don't just alert.",
    body: "Explain. Act. Learn. Verify.",
  },
  {
    n: "04",
    title: "Don't fix the same thing twice.",
    body: "Every resolution should become a control.",
  },
  {
    n: "05",
    title: "Prove the value.",
    body: "If RADR says it created value, it should be able to prove it.",
  },
] as const;

export function CompanyPage() {
  return (
    <div className="radr">
      <SiteNav />
      <main>
        <section className="rx-page-hero" data-nav-theme="dark">
          <div className="rx-shell rx-page-hero-inner">
            <p className="rx-kicker">Company</p>
            <h1 className="rx-page-title">
              Too much money
              <br />
              disappears
              <br />
              between systems.
            </h1>
            <p className="rx-lead-inv rx-lead-short">
              Complex operations run across dozens of systems, teams and
              decisions.
              <br />
              <br />
              Nobody sees all of it.
              <br />
              <br />
              RADR exists to watch the difference.
            </p>
          </div>
        </section>

        <section className="rx-co-section" data-nav-theme="dark">
          <div className="rx-shell">
            <p className="rx-kicker">The gap</p>
            <h2 className="rx-display rx-display-sm">
              The money disappears
              <br />
              between systems.
            </h2>
            <p className="rx-lead-inv rx-lead-short">
              RADR watches the gaps.
            </p>
            <ul className="rx-co-systems">
              {SYSTEMS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="rx-co-bridge">Small gaps appear between the systems.</p>
            <ul className="rx-co-gaps">
              {GAPS.map((g) => (
                <li key={g}>
                  <span className="rx-tri">△</span> {g}
                </li>
              ))}
            </ul>
            <p className="rx-co-claim">
              Nobody owns the difference.
              <br />
              <strong>RADR does.</strong>
            </p>
          </div>
        </section>

        <section className="rx-co-section rx-co-section--tight" data-nav-theme="dark">
          <div className="rx-shell rx-co-narrow">
            <p className="rx-kicker">Beachhead</p>
            <h2 className="rx-display rx-display-sm">
              Built first for
              <br />
              hospitality.
            </h2>
            <p className="rx-lead-inv">
              Hospitality combines thin margins, high transaction volume, labor
              intensity, fragmented systems, volatile demand and complex supplier
              relationships.
            </p>
            <p className="rx-lead-inv">
              It is the perfect proving ground — and where we show the product
              with invoices, schedules, rates, credits and settlements you
              already recognize.
            </p>
          </div>
        </section>

        <section className="rx-co-section rx-co-section--tight" data-nav-theme="dark">
          <div className="rx-shell rx-co-narrow">
            <p className="rx-kicker">Why now</p>
            <h2 className="rx-display rx-display-sm">
              Continuous comparison
              <br />
              is finally possible.
            </h2>
            <p className="rx-lead-inv">
              For years, finding these issues required spreadsheets, manual
              reconciliation, consultants, finance teams — or an operator
              noticing something looked wrong.
            </p>
            <p className="rx-lead-inv">
              Now software can continuously compare what happened with what
              should have happened. RADR turns that into an always-on margin
              intelligence layer.
            </p>
          </div>
        </section>

        <section className="rx-co-section" data-nav-theme="dark">
          <div className="rx-shell">
            <p className="rx-kicker">What we believe</p>
            <ol className="rx-co-beliefs">
              {BELIEFS.map((b) => (
                <li key={b.n}>
                  <span>{b.n}</span>
                  <div>
                    <h3>{b.title}</h3>
                    <p>{b.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rx-co-vision" data-nav-theme="dark">
          <div className="rx-shell">
            <p className="rx-kicker">The vision</p>
            <h2 className="rx-page-title">
              Every complex
              <br />
              operation on RADR.
            </h2>
            <p className="rx-lead-inv rx-lead-short">
              Hospitality first. Then any complex operation where money leaks
              between systems, teams and decisions.
            </p>
          </div>
        </section>

        <section className="rx-co-section" id="trust" data-nav-theme="dark">
          <div className="rx-shell rx-co-narrow">
            <p className="rx-kicker">Trust</p>
            <h2 className="rx-display rx-display-sm">
              Built for sensitive
              <br />
              commercial data.
            </h2>
            <ul className="rx-co-trust">
              {TRUST_CONTROLS.map((t) => (
                <li key={t.label}>
                  <span>{t.label}</span>
                  <em data-status={t.status === "LIVE" ? "on" : "dev"}>
                    {t.status}
                  </em>
                </li>
              ))}
            </ul>
            <p className="rx-co-trust-note">
              We only claim controls that are actually in place.{" "}
              <Link href="/security">Full security page →</Link>
            </p>
          </div>
        </section>

        <SectionFinal />
      </main>
      <SiteFooter />
    </div>
  );
}
