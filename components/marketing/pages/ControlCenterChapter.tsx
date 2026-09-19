"use client";

/**
 * Control Center — Needs you / handling / within expectations.
 * LIVE open Decisions only in Needs You. No sealed D-4102.
 */

import { useState } from "react";
import NextLink from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { euro } from "@/lib/marketing/publicDecisionEconomics";
import {
  LIVE_D7021,
  LIVE_D7022,
  MORNING_BRIEF_LIVE,
  ROUTINE_SIGNALS_SUPPRESSED,
} from "@/lib/marketing/publicLiveDecisions";
import { SilenceField } from "@/components/marketing/kinetic/SilenceField";
import { AttentionBrief } from "@/components/marketing/primitives/AttentionBrief";
import { CTAS } from "@/lib/marketing/brand";
import { capabilityBadge } from "@/lib/marketing/capabilityStatus";
import "@/app/product-chapters.css";
import "@/app/econ.css";
import "@/app/kinetic.css";
import "@/app/radr-public.css";

const ROLES = [
  {
    id: "cfo",
    label: "Group CFO",
    line: `${LIVE_D7021.displayId} · ${euro(LIVE_D7021.economics.exposed)} unexplained`,
    meta: `${LIVE_D7021.location} · ${LIVE_D7021.classLabel}`,
  },
  {
    id: "ops",
    label: "Ops",
    line: `${LIVE_D7022.displayId} · ${euro(LIVE_D7022.economics.exposed)} at risk`,
    meta: `${LIVE_D7022.location} · ${LIVE_D7022.classLabel}`,
  },
  {
    id: "gm",
    label: "GM",
    line: `${MORNING_BRIEF_LIVE.length} things need you · everything else within expectations`,
    meta: "Same brief · role lens",
  },
] as const;

export function ControlCenterChapter() {
  const [role, setRole] = useState<(typeof ROLES)[number]["id"]>("cfo");
  const active = ROLES.find((r) => r.id === role) ?? ROLES[0]!;

  return (
    <div className="radr rx-ch rx-ch-light">
      <SiteNav />
      <main className="rx-ch-main">
        <section
          className="rx-cc-silence-hero rx-cc-silence-hero-solid"
          data-nav-theme="dark"
        >
          <div className="rx-cc-silence-field" data-phase="silence">
            <div className="rx-shell rx-cc-silence-final">
              <p className="rx-ch-kicker" style={{ color: "#00d978" }}>
                Control Center · {capabilityBadge("controlCenter")}
              </p>
              <h1 className="rx-ch-title" style={{ color: "#f7faf8" }}>
                The most important thing RADR removes is noise.
              </h1>
              <SilenceField
                signalsLabel={`${ROUTINE_SIGNALS_SUPPRESSED} routine changes suppressed`}
                needsYou={MORNING_BRIEF_LIVE.length}
              />
              <p
                className="rx-pilot-note"
                style={{
                  color: "rgba(247,250,248,0.78)",
                  marginTop: "0.75rem",
                }}
              >
                DEMO · ILLUSTRATIVE · not customer results
              </p>
            </div>
          </div>
        </section>

        <section className="rx-ch-body" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-hcc-greet">Good morning.</p>
            <AttentionBrief count={MORNING_BRIEF_LIVE.length} />

            <ul className="rx-hcc-rows" style={{ marginTop: "1.5rem" }}>
              {MORNING_BRIEF_LIVE.map((d) => (
                <li key={d.displayId}>
                  <div className="rx-hcc-row-meta">
                    <em>
                      {d.location} · {d.classLabel}
                    </em>
                    <span className="rx-hcc-id">{d.displayId}</span>
                  </div>
                  <p className="rx-hcc-euro">
                    <strong>{euro(d.economics.exposed)}</strong>
                    <span>
                      {d.state === "investigate" ? "unexplained" : "at risk"}
                    </span>
                  </p>
                  <p className="rx-hcc-line">{d.line}</p>
                  <p className="rx-hcc-detail">{d.detail}</p>
                  <NextLink href={d.ctaHref} className="rx-hcc-cta">
                    {d.cta} <span aria-hidden="true">→</span>
                  </NextLink>
                </li>
              ))}
            </ul>

            <p className="rx-hcc-quiet" style={{ marginTop: "1.25rem" }}>
              Routine signals suppressed · {ROUTINE_SIGNALS_SUPPRESSED} routine
              changes suppressed
            </p>

            <p className="rx-ch-kicker" style={{ marginTop: "3rem" }}>
              Role lens · same LIVE brief
            </p>
            <div className="rx-plat-stage-rail" role="tablist">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="tab"
                  data-on={role === r.id ? "true" : "false"}
                  aria-selected={role === r.id}
                  onClick={() => setRole(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <article className="rx-cc-lens rx-cc-lens-solid" key={active.id}>
              <div className="rx-cc-lens-copy">
                <em>{active.label} lens</em>
                <strong>{active.line}</strong>
                <span>{active.meta}</span>
              </div>
            </article>

            <div className="rx-ch-ctas">
              <NextLink href="/app" className="rx-btn rx-btn-primary">
                {CTAS.openBrief} <span aria-hidden="true">→</span>
              </NextLink>
              <NextLink href="/contact" className="rx-btn rx-btn-ghost">
                {CTAS.primarySales}
              </NextLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
