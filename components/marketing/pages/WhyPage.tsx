"use client";

/**
 * Why RADR — keynote, not academic essay.
 * Decision problem → six truths → nobody owns the gap → RADR does → judgment.
 */

import { useState } from "react";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "../SiteFooter";
import { SiteNav } from "../SiteNav";
import { CATEGORY, CTAS } from "@/lib/marketing/brand";
import { CANON_OTA } from "@/lib/radr/decision/demo/canonical";
import "@/app/product-chapters.css";
import "@/app/kinetic.css";
import "@/app/radr-public.css";

const FRAGMENTS = [
  { label: "PMS", value: "Nearly full" },
  { label: "Revenue", value: "Demand strong" },
  { label: "Channel", value: "OTA +11" },
  { label: "Booking", value: "Direct ahead" },
  { label: "Housekeeping", value: "Premium ready" },
  { label: "Events", value: "Compression" },
] as const;

const JUDGMENT = [
  {
    k: "Decision",
    b: "What to do next — with evidence, economics, and a default.",
  },
  {
    k: "Outcome",
    b: "What reality returned after the action — observed, not hoped.",
  },
  {
    k: "Memory",
    b: "What the operation learned — so the next night starts smarter.",
  },
] as const;

const OBJECTIONS = [
  {
    q: "Does RADR replace our PMS, POS or RMS?",
    a: "No. Those systems remain sources of operational truth. RADR connects evidence across them to record Decisions.",
  },
  {
    q: "Is this just BI with AI?",
    a: "BI explains what happened. RADR models what could happen next, records what was chosen, and verifies what changed.",
  },
  {
    q: "How do you know RADR created the value?",
    a: "RADR stores the baseline, selected response, observed outcome, and verification method. Expected and Verified are never the same thing.",
  },
] as const;

export function WhyPage() {
  const [openQ, setOpenQ] = useState<number | null>(null);

  return (
    <div className="radr radr-mineral rx-ch-light">
      <SiteNav />
      <main>
        <section className="rx-ch-hero" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-ch-kicker">Why RADR</p>
            <h1 className="rx-ch-title rx-why-hero-display">
              Hospitality doesn&apos;t have a data problem.
              <br />
              It has a decision problem.
            </h1>
          </div>
        </section>

        <section className="rx-ch-body" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-why-frag-lead">
              Six systems.
              <br />
              Six pieces of truth.
              <br />
              One Decision.
            </p>

            <div
              className="rx-why-converge"
              aria-label="Signals converging into one Decision"
            >
              <ul className="rx-why-vectors">
                {FRAGMENTS.map((f) => (
                  <li key={f.label}>
                    <em>{f.label}</em>
                    <strong>{f.value}</strong>
                  </li>
                ))}
              </ul>
              <div className="rx-why-converge-core">
                <i aria-hidden="true" />
                <strong>{CANON_OTA.displayId}</strong>
                <em>One Decision</em>
                <p>Hold 4 premium rooms direct</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rx-why-gap-sec" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-ch-kicker">{CATEGORY.decisionGap}</p>
            <h2 className="rx-why-gap-title">
              Nobody owns the Decision
              <br />
              between them.
            </h2>
            <p className="rx-why-radr-does">RADR does.</p>
          </div>
        </section>

        <section className="rx-why-sodr rx-why-sodr-hero" data-nav-theme="light">
          <div className="rx-shell">
            <h2 className="rx-why-sodr-title">
              Systems of record store facts.
              <br />
              RADR stores judgment.
            </h2>

            <ul className="rx-why-judgment">
              {JUDGMENT.map((j) => (
                <li key={j.k}>
                  <strong>{j.k}</strong>
                  <p>{j.b}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rx-why-now" data-nav-theme="light">
          <div className="rx-shell">
            <ul className="rx-why-faq">
              {OBJECTIONS.map((row, i) => {
                const open = openQ === i;
                return (
                  <li key={row.q} data-open={open ? "true" : "false"}>
                    <button
                      type="button"
                      className="rx-why-faq-q"
                      aria-expanded={open}
                      onClick={() => setOpenQ(open ? null : i)}
                    >
                      {row.q}
                    </button>
                    {open ? <p className="rx-why-faq-a">{row.a}</p> : null}
                  </li>
                );
              })}
            </ul>

            <div className="rx-why-climax">
              <p className="rx-why-climax-h">
                The next layer
                <br />
                is Decision.
              </p>
              <div className="rx-ch-ctas">
                <NextLink
                  href="/contact?intent=recovery-pilot"
                  className="rx-btn rx-btn-primary"
                >
                  {CTAS.primarySales} <span aria-hidden="true">→</span>
                </NextLink>
                <Link href="/product" className="rx-btn rx-btn-ghost">
                  Platform
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
