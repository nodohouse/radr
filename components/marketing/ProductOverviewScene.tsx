"use client";

import { Link } from "@/i18n/navigation";
import { CANON_PEAK, money } from "@/data/demo";
import { CTAS } from "@/lib/marketing/brand";

/** Compact Platform decision moment — Berlin · D-1911. */
export function ProductOverviewScene() {
  const d = CANON_PEAK;
  return (
    <div className="rx-pos">
      <div className="rx-pos-stage">
        <article className="rx-pos-card">
          <header className="rx-pos-chrome">
            <span>Control Center</span>
            <span>
              {d.property} · {d.displayId}
            </span>
          </header>
          <div className="rx-pos-body">
            <p className="rx-pos-kicker">NEEDS YOU</p>
            <h2 className="rx-pos-loc">{d.title}</h2>
            <p className="rx-pos-sum">{d.problemLine.replace("\n", " ")}</p>
            <p className="rx-pos-money">
              <strong>{money(d.exposureEuro)}</strong>
              <span>vs seat-now · before {d.deadline}</span>
            </p>
            <p className="rx-pos-rec">
              Recommended: Wait 12 minutes · {money(d.expectedProtectedEuro)}{" "}
              expected vs seating now
            </p>
            <Link href="/demo" className="rx-pos-cta">
              {CTAS.primaryProduct} →
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
