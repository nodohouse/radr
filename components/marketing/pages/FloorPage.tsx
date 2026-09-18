"use client";

/**
 * RADR Floor — product depth surface (not top-nav).
 * Decision layer reaches FOH without replacing POS.
 */

import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { PublicFooter, PublicNavbar } from "../PublicShell";
import { FloorMoment } from "../kinetic/FloorMoment";
import { CTAS } from "@/lib/marketing/brand";
import "@/app/kinetic.css";
import "@/app/product-chapters.css";
import "@/app/home.css";

const LOOP = [
  "Was recommendation followed?",
  "Did basket contribution improve?",
  "Did kitchen pressure worsen?",
  "Did guest substitute?",
  "Did turn time improve?",
  "Did service recovery work?",
] as const;

export function FloorPage() {
  return (
    <div className="radr radr-mineral rx-ch rx-ch-light">
      <PublicNavbar />
      <main>
        <section className="rx-plat-live-hero rx-plat-hero-quiet" data-nav-theme="light">
          <div className="rx-shell rx-plat-live-hero-copy">
            <p className="rx-cinema-kicker">Platform · RADR Floor</p>
            <h1>
              The Decision layer
              <br />
              reaches the floor.
            </h1>
            <p>
              RADR Floor gives FOH the context they need in the moment — without
              replacing the POS they already use.
            </p>
          </div>
        </section>

        <section className="rx-rec-sec" data-nav-theme="light">
          <div className="rx-shell">
            <FloorMoment />
          </div>
        </section>

        <section className="rx-rec-sec rx-rec-sec-band" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-rec-k">What the server sees</p>
            <h2 className="rx-rec-h">Only what is relevant to their role.</h2>
            <ul className="rx-floor-sees">
              {[
                "VIP / occasion",
                "Allergy",
                "Item outage",
                "Table urgency",
                "Recommended substitute",
                "Guest preference",
                "Service note",
                "Brief delta",
              ].map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <p className="rx-rec-p rx-rec-muted">
              Not shown on Floor: group financial exposure, supplier disputes,
              CFO metrics, portfolio economics. Same Decision — different
              projection.
            </p>
          </div>
        </section>

        <section className="rx-rec-sec" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-rec-k">Primary interaction</p>
            <h2 className="rx-rec-h">A live service companion — not a dashboard.</h2>
            <div className="rx-floor-tabs" aria-hidden="true">
              <span data-on="true">Now · 3 things to know</span>
              <span>Tables · contextual guidance</span>
              <span>Service · pressure / outages</span>
              <span>Brief · next 60–90m</span>
            </div>
          </div>
        </section>

        <section className="rx-rec-sec rx-rec-sec-band" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-rec-k">Learning loop</p>
            <h2 className="rx-rec-h">After service, RADR learns.</h2>
            <ul className="rx-floor-loop">
              {LOOP.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <p className="rx-rec-p">This feeds Operating Memory.</p>
            <div className="rx-he-ctas">
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
