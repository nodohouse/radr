"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import {
  BRIEF_ATTENTION,
  FINDING_FUNNEL,
  money,
  CANON_OTA,
  CANON_PEAK,
  CANON_ORPHAN,
} from "@/data/demo";
import {
  canonScenario,
} from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { CTAS } from "@/lib/marketing/brand";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";
import "@/app/product-chapters.css";
import "@/app/econ.css";

const PORTFOLIO = [
  {
    id: "ams",
    site: "Amsterdam",
    status: "needs-you",
    headline: "Needs you",
    line: `${money(CANON_OTA.exposureEuro)} channel exposure`,
    meta: `${CANON_OTA.displayId} · hold premium direct · not OTA dump`,
    src: "/demo/facilities/canal-deluxe-king.jpg",
    pos: "58% 38%",
  },
  {
    id: "ber",
    site: "Berlin",
    status: "needs-you",
    headline: "Needs you",
    line: `${money(CANON_PEAK.exposureEuro)} contribution vs seat-now`,
    meta: `${CANON_PEAK.displayId} · peak capacity collision · decide before 18:53`,
    src: "/demo/facilities/berlin-dining.jpg",
    pos: "50% 42%",
  },
  {
    id: "lis",
    site: "Lisbon",
    status: "watching",
    headline: "Watching",
    line: "Within playbook · no action",
    meta: `${CANON_ORPHAN.displayId} · ${CANON_ORPHAN.property} · orphan gap open`,
    src: "/demo/facilities/lisbon-studio.jpg",
    pos: "52% 48%",
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
    label: "GM",
    lens: "portfolio",
    line: `${BRIEF_ATTENTION.needsYou} things need you · Lisbon stays quiet`,
    meta: "Amsterdam channel · Berlin peak capacity — judgment only",
    src: "/demo/facilities/canal-deluxe-king.jpg",
    exposure: CANON_OTA.exposureEuro,
    decision: `${CANON_OTA.displayId} · ${CANON_OTA.title}`,
  },
  {
    id: "cfo",
    label: "CFO",
    lens: "economics",
    line: `Hold ${formatDecisionMoney(otaHold.expectedContributionEuro ?? 0)} vs release ${formatDecisionMoney(otaRelease.expectedContributionEuro ?? 0)} on Amsterdam`,
    meta: `Berlin: wait ${waitExpected} vs seat ${seatExpected} expected`,
    src: "/demo/facilities/canal-suite.jpg",
    exposure: CANON_OTA.exposureEuro + CANON_PEAK.exposureEuro,
    decision: "Portfolio exposure · 2 judgments",
  },
  {
    id: "coo",
    label: "COO",
    lens: "pattern",
    line: `3rd OTA intervention at Canal House · ${CANON_PEAK.structural!.incidents}th peak collision in Berlin`,
    meta: `${CANON_PEAK.structural!.recommendation} · Lisbon stays inside orphan playbook`,
    src: "/demo/facilities/berlin-terrace.jpg",
    exposure: CANON_PEAK.structural!.cumulativeExposureEuro,
    decision: "Recurring patterns · not one alert firehose",
  },
] as const;

const PULSES = Array.from({ length: 64 }, (_, i) => ({
  id: i,
  x: (i * 41) % 100,
  y: (i * 67) % 100,
}));

function needsYouLabel(n: number): string {
  return n === 1 ? "THING NEEDS YOU" : "THINGS NEED YOU";
}

/**
 * Control Center — compression into silence.
 */
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
        <section className="rx-cc-silence-hero" data-nav-theme="dark">
          <Image
            src="/demo/facilities/canal-deluxe-king.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="rx-cc-silence-img"
            style={{ objectPosition: "55% 40%" }}
          />
          <div className="rx-cc-silence-veil" />
          <div
            className="rx-cc-silence-field"
            data-phase={phase}
            aria-label="Attention compression"
          >
            <div className="rx-cc-silence-pulses" aria-hidden="true">
              {PULSES.map((p) => (
                <i key={p.id} style={{ left: `${p.x}%`, top: `${p.y}%` }} />
              ))}
            </div>
            <div className="rx-shell rx-cc-silence-final">
              <h1 className="rx-ch-title" style={{ color: "#f7faf8" }}>
                The most important thing RADR removes is noise.
              </h1>
              <p
                className="rx-cc-silence-need"
                data-on={phase === "field" ? "true" : "false"}
              >
                <strong>{FINDING_FUNNEL.signals.toLocaleString("en-US")}</strong>
                <span>SIGNALS OBSERVED · MOST SUPPRESSED</span>
              </p>
              <p className="rx-cc-silence-need" data-on={phase === "silence" ? "true" : "false"}>
                <strong>{BRIEF_ATTENTION.needsYou}</strong>
                <span>
                  {needsYouLabel(BRIEF_ATTENTION.needsYou)} · EVERYTHING ELSE
                  WITHIN EXPECTATIONS
                </span>
              </p>
              <p
                style={{
                  margin: "1.25rem 0 0",
                  maxWidth: "28rem",
                  fontSize: "0.92rem",
                  color: "rgba(247,250,248,0.55)",
                  lineHeight: 1.45,
                }}
              >
                RADR does not win by showing you more. It wins by knowing what
                deserves your attention.
              </p>
            </div>
          </div>
        </section>

        <section className="rx-ch-body" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-ch-kicker">
              Group brief · Since your last check · DEMO · ILLUSTRATIVE
            </p>
            <div
              className="rx-cc-portfolio"
              aria-label="Portfolio spatial brief"
              style={{ marginBottom: "2.5rem" }}
            >
              {PORTFOLIO.map((p) => (
                <article
                  key={p.id}
                  className="rx-cc-portfolio-card"
                  data-site={p.id}
                  data-status={p.status}
                >
                  <div className="rx-cc-portfolio-thumb" aria-hidden="true">
                    <Image
                      src={p.src}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 40vw, 180px"
                      style={{ objectFit: "cover", objectPosition: p.pos }}
                    />
                  </div>
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

            <p className="rx-ch-kicker">Same portfolio · different lens</p>
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

            <article className="rx-cc-lens" data-lens={active.lens} key={active.id}>
              <div className="rx-cc-lens-photo">
                <Image
                  src={active.src}
                  alt=""
                  fill
                  sizes="(max-width: 800px) 100vw, 48vw"
                  style={{ objectFit: "cover", objectPosition: "50% 40%" }}
                />
                <div className="rx-cc-lens-ring" />
              </div>
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
              <NextLink href="/product/control-center" className="rx-btn rx-btn-primary">
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
