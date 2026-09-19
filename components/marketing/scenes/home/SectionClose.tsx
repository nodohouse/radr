"use client";

import NextLink from "next/link";
import { Link } from "@/i18n/navigation";

/**
 * Close — final commercial beat. Compact: one line, one proof, CTAs.
 */
export function SectionClose() {
  return (
    <section
      className="rx-scene rx-scene-close"
      data-mode="statement"
      data-nav-theme="light"
      id="close"
    >
      <div className="rx-shell">
        <div className="rx-close-inner">
          <p className="rx-kicker">Business-critical</p>
          <h2 className="rx-close-title">
            Hospitality margins are too thin for important decisions to be late.
          </h2>
          <div className="rx-ctas">
            <NextLink href="/demo" className="rx-btn rx-btn-primary">
              See how RADR decides <span aria-hidden="true">→</span>
            </NextLink>
            <Link href="/contact" className="rx-btn rx-btn-ghost">
              Book a demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
