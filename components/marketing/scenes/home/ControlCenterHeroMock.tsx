"use client";

/**
 * Hero Control Center mock — marketing preview only.
 * Graphics are not demo links. Single CTA unlocks signup.
 */

import { Link } from "@/i18n/navigation";
import { demoSignupHref } from "@/lib/marketing/demoAccess";
import "@/app/radr-public.css";
import "@/components/product/control-center/control-center-cockpit.css";

export function ControlCenterHeroMock() {
  return (
    <aside
      className="rx-cc-hero-mock rp-cock"
      data-cockpit="true"
      aria-label="RADR Control Center preview"
    >
      <header className="rp-cock-strip">
        <div className="rp-cock-strip-lead">
          <p className="rp-cock-greet">Good morning</p>
          <p className="rp-cock-judgment" data-need="true">
            2 need your judgment
          </p>
        </div>
        <ul className="rp-cock-since" aria-label="Since your last check">
          <li>
            <span>Contribution deteriorated −$1.2k · COGS + delivery explain 82%.</span>
          </li>
          <li>
            <span>Soho enters Watch · peak pressure expected 20:10.</span>
          </li>
          <li>
            <span>$273 became Verified · supplier credit matched.</span>
          </li>
        </ul>
      </header>

      <div className="rx-cc-hero-mock-grid">
        <section className="rx-cc-hero-mock-sit">
          <p className="rp-cock-k">Operating situation</p>
          <h2 className="rp-cock-statement">
            <span>
              Revenue is ahead.
              <br />
            </span>
            <span>
              Contribution isn&apos;t.
              <br />
            </span>
          </h2>
          <ul className="rp-cock-wf" aria-label="Contribution bridge">
            <li data-kind="positive">
              <span className="rp-cock-wf-lab">Sales</span>
              <strong>+$6,800</strong>
            </li>
            <li data-kind="negative">
              <span className="rp-cock-wf-lab">COGS</span>
              <strong>−$4,120</strong>
            </li>
            <li data-kind="negative">
              <span className="rp-cock-wf-lab">Labor</span>
              <strong>−$3,200</strong>
            </li>
          </ul>
        </section>

        <aside className="rp-handoff rx-cc-hero-mock-hand" aria-label="Needs your judgment">
          <header className="rp-handoff-head">
            <p className="rp-handoff-count">
              <strong>02</strong>
              <span>NEED YOUR JUDGMENT</span>
            </p>
          </header>
          <div className="rp-handoff-stack">
            <div className="rp-handoff-card" data-primary="true">
              <div className="rp-handoff-id-row">
                <span className="rp-handoff-id">D-1911</span>
                <span className="rp-handoff-deadline">11 min</span>
              </div>
              <p className="rp-handoff-verb">WAIT 12 MINUTES</p>
              <div className="rp-handoff-econ">
                <strong>+$620</strong>
                <span>expected contribution</span>
              </div>
              <p className="rp-handoff-where">Soho · New York</p>
              <p className="rp-handoff-causal">
                38 inbound · Delivery +31% · Kitchen →97%
              </p>
            </div>
            <div className="rp-handoff-card-sm">
              <span className="rp-handoff-id">D-7501</span>
              <p className="rp-handoff-verb-sm">
                Category rebalance — not blunt reprice
              </p>
              <strong className="rp-handoff-econ-sm">+$168</strong>
            </div>
          </div>
          <Link href={demoSignupHref()} className="rp-handoff-master">
            See RADR in action →
          </Link>
        </aside>
      </div>

      <p className="rx-cc-hero-mock-note">
        Illustrative preview · not customer results
      </p>
    </aside>
  );
}
