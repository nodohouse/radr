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
import "@/app/radr-public.css";

const ARCH = [
  { href: "/product/control-center", label: "Control Center" },
  { href: "/product/decisions", label: "Decision" },
  { href: "/product/futures", label: "Futures" },
  { href: "/product/actions", label: "Action" },
  { href: "/product/value", label: "Verified" },
  { href: "/product/memory", label: "Memory" },
] as const;

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
              Restaurant · Hotel · Serviced apartment — same Decision object,
              every stage.
            </p>
            <nav className="rx-plat-arch" aria-label="Platform architecture">
              {ARCH.map((a, i) => (
                <span key={a.href}>
                  {i > 0 ? <i aria-hidden="true">→</i> : null}
                  <NextLink href={a.href}>{a.label}</NextLink>
                </span>
              ))}
            </nav>
          </div>
        </section>

        <PlatformDecisionTheater />

        <section className="rx-plat-close" data-nav-theme="light">
          <div className="rx-shell">
            <h2 className="rx-rec-h">Start where the economics are clearest.</h2>
            <p className="rx-rec-p">
              Recovery Pilot on Supplier/AP and/or Reconciliation — then expand
              the same Decision layer across hospitality operations.
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
