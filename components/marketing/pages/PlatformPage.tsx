"use client";

/**
 * Platform — flagship Decision theater.
 * Quiet hero → kinetic rail + sticky Decision object.
 */

import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { PublicFooter, PublicNavbar } from "../PublicShell";
import { PlatformDecisionTheater } from "./PlatformDecisionTheater";
import { CTAS } from "@/lib/marketing/brand";
import "@/app/product-chapters.css";
import "@/app/editorial.css";
import "@/app/econ.css";
import "@/app/home.css";
import "@/app/kinetic.css";

export function PlatformPage() {
  return (
    <div className="radr radr-mineral rx-ch rx-ch-light">
      <PublicNavbar />
      <main className="rx-plat-live">
        <section
          className="rx-plat-live-hero rx-plat-live-hero-light rx-plat-hero-quiet"
          data-nav-theme="light"
        >
          <div className="rx-shell rx-plat-live-hero-copy">
            <p className="rx-cinema-kicker">Platform</p>
            <h1>
              One Decision.
              <br />
              From first signal to lasting memory.
            </h1>
            <p>
              Systems record what happened. RADR determines what matters, what
              the alternatives are, what should happen next, and whether the
              outcome was worth it.
            </p>
          </div>
        </section>

        <PlatformDecisionTheater />

        <section className="rx-plat-close" data-nav-theme="light">
          <div className="rx-shell">
            <h2 className="rx-rec-h">Start where the economics are clearest.</h2>
            <p className="rx-rec-p">
              Recovery Pilot on Supplier/AP and/or Reconciliation — then expand
              the same Decision layer.
            </p>
            <div className="rx-he-ctas">
              <Link
                href="/contact?intent=recovery-pilot"
                className="rx-btn rx-btn-primary"
              >
                {CTAS.primaryProduct} <span aria-hidden="true">→</span>
              </Link>
              <NextLink
                href={CTAS.secondaryProductHref}
                className="rx-btn rx-btn-ghost"
              >
                {CTAS.secondaryProduct}
              </NextLink>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
