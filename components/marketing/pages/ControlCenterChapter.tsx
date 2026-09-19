"use client";

/**
 * Control Center — compression into silence.
 * Structured system traces fade; material Decisions remain.
 */

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import {
  BRIEF_ATTENTION,
  money,
  CANON_OTA,
  CANON_PEAK,
  CANON_ORPHAN,
} from "@/data/demo";
import {
  canonScenario,
  CANON_SUPPLIER,
} from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { SilenceField } from "@/components/marketing/kinetic/SilenceField";
import { CTAS } from "@/lib/marketing/brand";
import { capabilityBadge } from "@/lib/marketing/capabilityStatus";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";
import "@/app/product-chapters.css";
import "@/app/econ.css";
import "@/app/kinetic.css";

const PORTFOLIO = [
  {
    id: "ams",
    site: "Amsterdam",
    status: "needs-you",
    headline: "Needs you",
    line: `${money(CANON_OTA.exposureEuro)} channel exposure`,
    meta: `${CANON_OTA.displayId} · hold premium direct · not OTA dump`,
  },
  {
    id: "ber",
    site: "Berlin",
    status: "needs-you",
    headline: "Needs you",
    line: `${money(CANON_PEAK.exposureEuro)} contribution vs seat-now`,
    meta: `${CANON_PEAK.displayId} · peak capacity · decide before 18:53`,
  },
  {
    id: "lis",
    site: "Lisbon",
    status: "watching",
    headline: "Watching",
    line: "Within playbook · no action",
    meta: `${CANON_ORPHAN.displayId} · ${CANON_ORPHAN.property}`,
  },
] as const;

const otaHold = canonScenario(CANON_OTA, "hold_72h")!;
const otaRelease = canonScenario(CANON_OTA, "do_nothing")!;
const waitExpected = formatDecisionMoney(
  canonScenario(CANON_PEAK, "wait_12")!.expectedContributionEuro ?? 0,
);
const seatExpected = formatDecisionMoney(
  canonScenario(CANON_PEAK, "seat_now")!.expectedContributionEuro ?? 0,
);

const ROLES = [
  {
    id: "gm",
    label: "Restaurant GM",
    lens: "portfolio",
    line: `${BRIEF_ATTENTION.needsYou} things need you · peak collision tonight`,
    meta: `Berlin · wait ${waitExpected} vs seat ${seatExpected}`,
    exposure: CANON_PEAK.exposureEuro,
    decision: `${CANON_PEAK.displayId} · ${CANON_PEAK.title}`,
  },
  {
    id: "hotel",
    label: "Hotel GM",
    lens: "pattern",
    line: `Hold ${formatDecisionMoney(otaHold.expectedContributionEuro ?? 0)} vs release ${formatDecisionMoney(otaRelease.expectedContributionEuro ?? 0)}`,
    meta: "Canal House · premium inventory · 72h",
    exposure: CANON_OTA.exposureEuro,
    decision: `${CANON_OTA.displayId} · ${CANON_OTA.title}`,
  },
  {
    id: "cfo",
    label: "Group CFO",
    lens: "economics",
    line: `Portfolio · ${BRIEF_ATTENTION.needsYou} judgments across environments`,
    meta: `Berlin peak + Amsterdam channel · ${formatDecisionMoney(CANON_SUPPLIER.exposureEuro)} supplier open`,
    exposure: CANON_OTA.exposureEuro + CANON_PEAK.exposureEuro,
    decision: "Group exposure · same Decision engine",
  },
] as const;

function needsYouLabel(n: number): string {
  return n === 1 ? "THING NEEDS YOU" : "THINGS NEED YOU";
}

export function ControlCenterChapter() {
  const [role, setRole] = useState<(typeof ROLES)[number]["id"]>("gm");
  const [phase, setPhase] = useState<"field" | "silence">("field");
  const active = ROLES.find((r) => r.id === role) ?? ROLES[0]!;
  const reduced = useReducedMotionSafe();

  useEffect(() => {
    if (reduced) {
      setPhase("silence");
      return;
    }
    setPhase("field");
    const t = window.setTimeout(() => setPhase("silence"), 1800);
    return () => window.clearTimeout(t);
  }, [reduced, role]);

  return (
    <div className="radr rx-ch rx-ch-light">
      <SiteNav />
      <main className="rx-ch-main">
        <section className="rx-cc-silence-hero rx-cc-silence-hero-solid" data-nav-theme="dark">
          <div
            className="rx-cc-silence-field"
            data-phase={phase}
            aria-label="Attention compression"
          >
            <div className="rx-shell rx-cc-silence-final">
            <p className="rx-ch-kicker" style={{ color: "#00d978" }}>
              Control Center · {capabilityBadge("controlCenter")}
            </p>
            <h1 className="rx-ch-title" style={{ color: "#f7faf8" }}>
                The most important thing RADR removes is noise.
              </h1>
              <SilenceField
                signalsLabel="Routine signals suppressed"
                needsYou={BRIEF_ATTENTION.needsYou}
              />
              <p
                className="rx-pilot-note"
                style={{ color: "rgba(247,250,248,0.78)", marginTop: "0.75rem" }}
              >
                DEMO · ILLUSTRATIVE · not customer results
              </p>
              <p
                className="rx-cc-silence-need"
                data-on={phase === "silence" ? "true" : "false"}
                style={{ marginTop: "1rem" }}
              >
                <strong>{BRIEF_ATTENTION.needsYou}</strong>
                <span>
                  {needsYouLabel(BRIEF_ATTENTION.needsYou)} · EVERYTHING ELSE
                  WITHIN EXPECTATIONS
                </span>
              </p>
            </div>
          </div>
        </section>

        <section className="rx-ch-body" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-ch-kicker">
              Control Center · {capabilityBadge("controlCenter")} · Shift Pulse →
              primary Decision → role lens
            </p>
            <div
              className="rx-cc-portfolio"
              aria-label="Shift Pulse · portfolio brief"
              style={{ marginBottom: "2.5rem" }}
            >
              {PORTFOLIO.map((p) => (
                <article
                  key={p.id}
                  className="rx-cc-portfolio-card"
                  data-site={p.id}
                  data-status={p.status}
                >
                  <div className="rx-cc-portfolio-copy">
                    <em>{p.headline}</em>
                    <strong>
                      {p.site} · {p.line}
                    </strong>
                    <span>{p.meta}</span>
                  </div>
                </article>
              ))}
            </div>

            <p className="rx-ch-kicker">Primary Decision · role lens</p>
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

            <article className="rx-cc-lens rx-cc-lens-solid" data-lens={active.lens} key={active.id}>
              <div className="rx-cc-lens-copy">
                <em>
                  {active.label} lens · {active.lens}
                </em>
                <strong>{active.line}</strong>
                <span>{active.meta}</span>
                <p>
                  <strong className="rx-econ-risk">{money(active.exposure)}</strong>
                  <span> · {active.decision}</span>
                </p>
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
