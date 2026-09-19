"use client";

import Link from "next/link";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { demoValueUnderRadr } from "@/lib/radr/decision/economics";

/**
 * Thin ROI proof strip — not a full scene.
 */
export function SectionRoiStrip() {
  const v = demoValueUnderRadr();

  return (
    <section className="rx-roi-strip" data-nav-theme="light" aria-label="Verified portfolio">
      <div className="rx-shell rx-roi-strip-inner">
        <div className="rx-roi-strip-stat">
          <strong className="rx-econ-verified">
            {formatDecisionMoney(v.verifiedEuro)}
          </strong>
          <span>VERIFIED VALUE</span>
        </div>
        <div className="rx-roi-strip-stat">
          <strong>221</strong>
          <span>VERIFIED OUTCOMES</span>
        </div>
        <div className="rx-roi-strip-stat">
          <strong>17</strong>
          <span>LEARNED PLAYBOOKS</span>
        </div>
        <p className="rx-roi-strip-note">DEMO PORTFOLIO · ILLUSTRATIVE</p>
        <Link href="/product/value" className="rx-roi-strip-go">
          Open the proof →
        </Link>
      </div>
    </section>
  );
}
