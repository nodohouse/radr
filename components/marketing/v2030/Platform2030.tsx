"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { PublicFooter, PublicNavbar } from "@/components/marketing/PublicShell";
import { CTAS } from "@/lib/marketing/brand";
import { PUBLIC_POSITIONING } from "@/lib/marketing/publicCanon";
import {
  PlatformSurfacePreview,
  type SurfaceId,
} from "@/components/marketing/v2030/PlatformSurfacePreview";
import { SilkAtmosphere } from "@/components/marketing/v2030/SilkAtmosphere";
import "@/app/marketing-2030.css";
import "@/app/brand-takeover.css";

const MODULES: { id: SurfaceId; label: string; body: string }[] = [
  {
    id: "control",
    label: "Control Center",
    body: "What needs you now: attention, top Decision, verified since last check.",
  },
  {
    id: "live",
    label: "Live",
    body: "What is happening now: pressure, objects, intervene.",
  },
  {
    id: "decisions",
    label: "Decisions",
    body: "Evidence → futures → recommendation → approval → verification.",
  },
  {
    id: "operations",
    label: "Operations",
    body: "Can we run today successfully: service, kitchen, readiness, labor.",
  },
  {
    id: "intelligence",
    label: "Intelligence",
    body: "Why this is happening: ranked findings, drivers, confidence, economics.",
  },
  {
    id: "value",
    label: "Value",
    body: "Expected · Observed · Verified. Proof path, not vanity totals.",
  },
  {
    id: "memory",
    label: "Memory",
    body: "Calibration and playbooks after sufficient comparable evidence.",
  },
  {
    id: "health",
    label: "Data Health",
    body: "Evidence health → confidence → Decision → allowed action.",
  },
];

const ARCHITECTURE = [
  {
    n: "01",
    title: "Evidence becomes context",
    body: "Source systems feed one operating model: baselines, freshness, and drivers.",
  },
  {
    n: "02",
    title: "Context becomes a Decision",
    body: "Futures compared. Cost of doing nothing made explicit. Confidence visible.",
  },
  {
    n: "03",
    title: "Decisions become outcomes",
    body: "Prepare or act within policy. Seal Verified Value only when evidence supports it.",
  },
] as const;

const DECISION_STEPS = [
  "Evidence",
  "State",
  "Futures",
  "Recommendation",
  "Action",
  "Verification",
] as const;

const GOVERNANCE = [
  {
    title: "Confidence",
    body: "Every material recommendation shows how sure RADR is, and what would change the call.",
  },
  {
    title: "Policies",
    body: "Autonomy is per Decision type. Material external actions stay approval-gated unless you say otherwise.",
  },
  {
    title: "Approvals",
    body: "Prepared packages arrive ready to review: economics, options, and default clear.",
  },
  {
    title: "Auditability",
    body: "Evidence chain stays attached from detection through Verified Value.",
  },
] as const;

const LIVE_RENDERERS = [
  "Spatial",
  "Floor plan",
  "Schematic",
  "Operational grid",
] as const;

function readSurface(): SurfaceId {
  if (typeof window === "undefined") return "control";
  const raw = new URLSearchParams(window.location.search).get("surface");
  if (MODULES.some((m) => m.id === raw)) return raw as SurfaceId;
  return "control";
}

export function Platform2030() {
  const [mod, setMod] = useState<SurfaceId>("control");
  const [renderer, setRenderer] =
    useState<(typeof LIVE_RENDERERS)[number]>("Floor plan");
  const active = MODULES.find((m) => m.id === mod) ?? MODULES[0]!;

  useEffect(() => {
    setMod(readSurface());
  }, []);

  const select = useCallback((id: SurfaceId) => {
    setMod(id);
    const url = new URL(window.location.href);
    url.searchParams.set("surface", id);
    window.history.replaceState(null, "", url.toString());
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
        return;
      const idx = MODULES.findIndex((m) => m.id === mod);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        select(MODULES[(idx + 1) % MODULES.length]!.id);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        select(MODULES[(idx - 1 + MODULES.length) % MODULES.length]!.id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mod, select]);

  return (
    <div className="radr radr-mineral">
      <PublicNavbar />
      <div className="rx30 rx30--mockup">
        <main>
          <section
            className="rx30-bleed rx30-bleed--page"
            data-nav-theme="light"
            aria-labelledby="rx30-plat-title"
          >
            <SilkAtmosphere className="rx30-bleed-silk" />
            <div className="rx30-shell rx30-bleed-copy rx30-bleed-copy--solo">
              <p className="rx30-kicker">Platform</p>
              <h1 id="rx30-plat-title" className="rx30-bleed-h1">
                One intelligence layer for hospitality{" "}
                <em>operations.</em>
              </h1>
              <p className="rx30-bleed-lead">
                Connect source systems. Understand the operating state. Prepare
                better Decisions. Act with control. Verify what happened.
                Remember what worked.
              </p>
              <div className="rx30-ctas">
                <Link
                  href={CTAS.seeInActionHref}
                  className="rx30-btn rx30-btn-primary"
                >
                  See RADR in action <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/solutions"
                  className="rx30-btn rx30-btn-ghost rx30-btn-ghost--solid"
                >
                  Explore value leaks
                </Link>
              </div>
            </div>
          </section>

          <section className="rx30-connect" data-nav-theme="light">
            <div className="rx30-shell">
              <p className="rx30-kicker">01 · Decision architecture</p>
              <h2 className="rx30-h2">How evidence becomes operating context.</h2>
              <div className="rx30-flow-grid" style={{ marginTop: "2rem" }}>
                {ARCHITECTURE.map((f) => (
                  <article key={f.n}>
                    <em>{f.n}</em>
                    <strong>{f.title}</strong>
                    <span>{f.body}</span>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="rx30-pain" data-nav-theme="light">
            <div className="rx30-shell">
              <p className="rx30-kicker">02 · The Decision</p>
              <h2 className="rx30-h2">One object. Six beats.</h2>
              <ol className="rx30-pain-list rx30-plat-decision-beats">
                {DECISION_STEPS.map((s, i) => (
                  <li key={s}>
                    <em>{String(i + 1).padStart(2, "0")}</em>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="rx30-connect" data-nav-theme="light" id="surfaces">
            <div className="rx30-shell">
              <p className="rx30-kicker">03 · Product surfaces</p>
              <h2 className="rx30-h2">One shell. Surfaces for every role that needs them.</h2>
              <p className="rx30-lead">
                Switch between Control Center, Live, Decisions, Operations,
                Intelligence, Value, Memory, and Data Health. Same Decision
                architecture underneath.
              </p>
              <div className="rx30-module-rail" role="tablist">
                {MODULES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    data-on={mod === m.id ? "true" : undefined}
                    aria-selected={mod === m.id}
                    onClick={() => select(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="rx30-module-preview rx30-module-preview--morph rx30-plat-hero-shell">
                <div className="rx30-plat-shell-head">
                  <p className="rx30-demo-label">{active.label}</p>
                  <h3 className="rx30-h2" style={{ fontSize: "1.35rem", margin: 0 }}>
                    {active.body}
                  </h3>
                </div>
                {mod === "live" ? (
                  <>
                    <p className="rx30-lead" style={{ marginTop: "0.75rem" }}>
                      {PUBLIC_POSITIONING.livePrinciple}
                    </p>
                    <div
                      className="rx30-module-rail"
                      style={{ marginTop: "1rem" }}
                    >
                      {LIVE_RENDERERS.map((r) => (
                        <button
                          key={r}
                          type="button"
                          data-on={renderer === r ? "true" : undefined}
                          onClick={() => setRenderer(r)}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}
                <div className="rx30-plat-canvas" style={{ marginTop: "1.25rem" }}>
                  <PlatformSurfacePreview
                    surface={mod}
                    liveRenderer={renderer}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rx30-pain" data-nav-theme="light">
            <div className="rx30-shell">
              <p className="rx30-kicker">04 · Governance</p>
              <h2 className="rx30-h2">Control stays with the operator.</h2>
              <div className="rx30-pain-grid rx30-principles">
                {GOVERNANCE.map((g) => (
                  <article key={g.title} className="rx30-principle">
                    <strong>{g.title}</strong>
                    <span>{g.body}</span>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="rx30-connect" data-nav-theme="light">
            <div className="rx30-shell">
              <p className="rx30-kicker">05 · Verified outcomes</p>
              <h2 className="rx30-h2">Expected · Observed · Verified.</h2>
              <p className="rx30-lead">
                RADR never blurs the three. Verified Value seals only when
                downstream evidence supports the economic outcome.
              </p>
              <div className="rx30-flow-grid" style={{ marginTop: "1.75rem" }}>
                <article>
                  <em>01</em>
                  <strong>Expected</strong>
                  <span>What the Decision forecasted before action.</span>
                </article>
                <article>
                  <em>02</em>
                  <strong>Observed</strong>
                  <span>What the operation actually recorded afterward.</span>
                </article>
                <article>
                  <em>03</em>
                  <strong>Verified</strong>
                  <span>What evidence confirms, and Memory can learn from.</span>
                </article>
              </div>
            </div>
          </section>

          <section
            className="rx30-close rx30-close--saas"
            data-nav-theme="light"
          >
            <div className="rx30-shell rx30-close-inner">
              <h2 className="rx30-h2">See the Decision layer in your operation.</h2>
              <div className="rx30-ctas">
                <Link
                  href={CTAS.seeInActionHref}
                  className="rx30-btn rx30-btn-primary"
                >
                  See RADR in action <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/solutions"
                  className="rx30-btn rx30-btn-ghost rx30-btn-ghost--solid"
                >
                  Explore value leaks
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}
