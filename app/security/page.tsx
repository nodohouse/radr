import Link from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";

export default function SecurityPage() {
  return (
    <div className="radr">
      <SiteNav variant="pricing" />
      <main className="radr-section">
        <div className="radr-shell">
          <p className="radr-kicker">Security</p>
          <h1 className="radr-h2">
            Commercial data
            <br />
            deserves serious control.
          </h1>
          <p className="radr-lead">
            RADR is built for sensitive operational and financial evidence. We
            only claim controls that are actually in place — no fake compliance
            badges.
          </p>
          <ul className="radr-problem-grid" style={{ listStyle: "none", padding: 0 }}>
            {[
              "Private document storage",
              "Organization-isolated access",
              "Server-side authorization",
              "No public document URLs",
            ].map((item) => (
              <li className="radr-problem-item" key={item}>
                <h3>{item}</h3>
                <p>Designed</p>
              </li>
            ))}
          </ul>
          <p className="radr-lead">
            Security architecture is being implemented with the product. Details
            expand as controls ship.
          </p>
          <div className="radr-ctas">
            <Link href="/signup" className="radr-btn radr-btn-primary">
              See RADR <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
