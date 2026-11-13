import { Link } from "@/i18n/navigation";
import { PublicFooter, PublicNavbar } from "@/components/marketing/PublicShell";
import {
  ECONOMIC_GUIDES,
  type EconomicGuideId,
} from "@/lib/marketing/buyerGuide";
import { EconomicLensOverview } from "./BuyerGuide";
import { SilkAtmosphere } from "./SilkAtmosphere";
import "@/app/marketing-2030.css";
import "@/app/brand-takeover.css";
import "@/app/marketing-premium-pages.css";
import "@/app/buyer-guide.css";
export function EconomicLensPage({ lens }: { lens: EconomicGuideId }) {
  const g = ECONOMIC_GUIDES[lens];
  return (
    <div className="radr radr-mineral rm-premium">
      <PublicNavbar />
      <div className="rx30 rx30--mockup">
        <main>
          <section
            className="rx30-bleed rx30-bleed--page br-lens-hero"
            aria-labelledby="br-lens-title"
            data-nav-theme="light"
          >
            <SilkAtmosphere className="rx30-bleed-silk" />
            <div className="rx30-shell br-lens-hero-grid">
              <div>
                <p className="rx30-kicker">Solutions · {lens.toUpperCase()}</p>
                <h1 id="br-lens-title" className="rx30-bleed-h1">
                  {g.title}
                </h1>
                <p className="rx30-bleed-lead">{g.question}</p>
                <p className="br-lens-positioning">
                  One economic lens over RADR’s shared decision layer.
                </p>
                <div className="rx30-ctas">
                  <Link className="rx30-btn rx30-btn-primary" href="/demo">
                    Explore the demo →
                  </Link>
                  <Link
                    className="rx30-btn rx30-btn-ghost rx30-btn-ghost--solid"
                    href="/value-calculator"
                  >
                    Build your Value Map →
                  </Link>
                </div>
              </div>
              <aside className="br-example-card">
                <span>{lens.toUpperCase()} · OPERATING EXAMPLE</span>
                <h2>The context behind the number.</h2>
                <p>{g.example}</p>
                <small>{g.source}</small>
                <div className="br-evidence-chain" aria-hidden>
                  <b>Evidence</b>
                  <i />
                  <b>Decision</b>
                  <i />
                  <b>Verify</b>
                </div>
              </aside>
            </div>
          </section>
          <section className="rx30-connect">
            <div className="rx30-shell">
              <p className="rx30-kicker">A field guide for your next review</p>
              <h2 className="rx30-h2">Make the question answerable.</h2>
              <div className="br-method-grid">
                {[
                  ["Gather the evidence", g.records],
                  ["Compare like with like", g.comparison],
                  ["Review the response", g.decision],
                  ["Define the proof", g.verify],
                ].map(([title, body], i) => (
                  <article key={title}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </article>
                ))}
              </div>
              <div className="rx30-ctas">
                <Link className="br-inline-link" href={g.next}>
                  Read the practical guide →
                </Link>
                <Link className="br-inline-link" href="/product">
                  Follow a decision through RADR →
                </Link>
              </div>
            </div>
          </section>
          <EconomicLensOverview active={lens} />
          <section className="rx30-close rx30-close--saas">
            <div className="rx30-shell rx30-close-inner">
              <h2 className="rx30-h2">
                See how the evidence becomes a decision.
              </h2>
              <div className="rx30-ctas">
                <Link className="rx30-btn rx30-btn-primary" href="/demo">
                  Explore the demo →
                </Link>
                <Link
                  className="rx30-btn rx30-btn-ghost rx30-btn-ghost--solid"
                  href="/resources/hospitality-decision-playbook"
                >
                  Get the playbook →
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}
