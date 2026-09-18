"use client";

/**
 * RADR Floor — live operating intelligence surface.
 */

import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { PublicFooter, PublicNavbar } from "../PublicShell";
import { FloorLive } from "../kinetic/FloorLive";
import { CTAS } from "@/lib/marketing/brand";
import "@/app/kinetic.css";
import "@/app/product-chapters.css";
import "@/app/home.css";

export function FloorPage() {
  return (
    <div className="radr radr-mineral rx-ch rx-ch-light">
      <PublicNavbar />
      <main>
        <section className="rx-rec-sec" data-nav-theme="light" style={{ paddingTop: "5rem" }}>
          <div className="rx-shell">
            <FloorLive />
            <div className="rx-he-ctas" style={{ marginTop: "2rem" }}>
              <NextLink href="/product/memory" className="rx-btn rx-btn-ghost">
                Operating Memory <span aria-hidden="true">→</span>
              </NextLink>
              <Link
                href="/contact?intent=recovery-pilot"
                className="rx-btn rx-btn-primary"
              >
                {CTAS.primaryProduct} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
