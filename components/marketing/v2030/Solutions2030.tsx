"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { PublicFooter, PublicNavbar } from "@/components/marketing/PublicShell";
import { CTAS } from "@/lib/marketing/brand";
import { PUBLIC_SUPPLIER } from "@/lib/marketing/publicCanon";
import { stageSwap } from "@/lib/marketing/motion";
import { SilkAtmosphere } from "@/components/marketing/v2030/SilkAtmosphere";
import {
  LeakExplorerCanvas,
  type LeakId,
} from "@/components/marketing/v2030/LeakExplorerCanvas";
import "@/app/marketing-2030.css";
import "@/app/value-calculator.css";
import "@/app/brand-takeover.css";

const LEAKS: {
  id: LeakId;
  label: string;
  title: string;
  signal: string;
  cause: string;
  exposure: string;
  decision: string;
  recovery: string;
  verification: string;
  economics: { label: string; value: string }[];
  outcome: string;
}[] = [
  {
    id: "supplier",
    label: "Supplier / AP",
    title: "Contract price variance",
    signal: "Invoice unit price diverges from contracted terms.",
    cause: "Rate drift across deliveries without matching credit.",
    exposure: PUBLIC_SUPPLIER.exposureFormatted,
    decision: "Prepare dispute package with evidence chain.",
    recovery: "Submit for credit against the matched invoice.",
    verification: `${PUBLIC_SUPPLIER.verifiedFormatted} credit matched`,
    economics: [
      { label: "Contract", value: PUBLIC_SUPPLIER.contractFormatted },
      { label: "Invoice", value: PUBLIC_SUPPLIER.invoiceFormatted },
      { label: "Exposure", value: PUBLIC_SUPPLIER.exposureFormatted },
    ],
    outcome: `Illustrative verified · ${PUBLIC_SUPPLIER.verifiedFormatted}`,
  },
  {
    id: "recon",
    label: "Reconciliation",
    title: "Settlement streams diverge",
    signal: "POS expectation and payment settlement disagree.",
    cause: "Unexplained gap ages before anyone owns it.",
    exposure: "Material unexplained gap",
    decision: "Isolate gap and prepare credit or write-off path.",
    recovery: "Close the stream with a governed disposition.",
    verification: "Gap explained · disposition sealed",
    economics: [
      { label: "POS expected", value: "Modelled" },
      { label: "Settled", value: "Modelled" },
      { label: "Gap", value: "Unexplained" },
    ],
    outcome: "Gap explained · credit or write-off prepared",
  },
  {
    id: "cost",
    label: "Cost variance",
    title: "Margin drivers decompose",
    signal: "Food cost and yield drift vs plan.",
    cause: "Material SKU / prep drivers ranked by economics.",
    exposure: "Margin at risk this period",
    decision: "Prepare SKU or prep response with confidence.",
    recovery: "Act on the ranked driver. Not another BI chart.",
    verification: "Observed cost vs expected after action",
    economics: [
      { label: "Plan", value: "Baseline" },
      { label: "Actual", value: "Drift" },
      { label: "Driver", value: "Ranked" },
    ],
    outcome: "Prepared SKU / prep response",
  },
  {
    id: "proc",
    label: "Procurement",
    title: "Supplier price dispersion",
    signal: "Same item, different cities, different unit economics.",
    cause: "Material dispersion across the estate.",
    exposure: "Negotiation headroom",
    decision: "Prepare negotiation package across locations.",
    recovery: "Align rates or switch where policy allows.",
    verification: "Rate change matched to subsequent invoices",
    economics: [
      { label: "Low", value: "Peer" },
      { label: "High", value: "Outlier" },
      { label: "Spread", value: "Material" },
    ],
    outcome: "Negotiation package prepared",
  },
  {
    id: "perish",
    label: "Perishable revenue",
    title: "Value decays with the clock",
    signal: "Room nights and covers lose value as the deadline approaches.",
    cause: "Cost of doing nothing rises with the clock.",
    exposure: "Tonight / this week at risk",
    decision: "Compare pace / rate / channel futures.",
    recovery: "Choose the fork with clearest economics.",
    verification: "Observed revenue vs Expected after the night",
    economics: [
      { label: "Available", value: "Now" },
      { label: "Deadline", value: "Tonight" },
      { label: "Decay", value: "Perishable" },
    ],
    outcome: "Pace / rate / channel futures compared",
  },
];

const JOURNEY = [
  "Signal",
  "Cause",
  "Exposure",
  "Decision",
  "Recovery",
  "Verification",
] as const;

type Props = {
  lens?: string;
};

function readLeak(lens?: string): LeakId {
  if (lens && LEAKS.some((l) => l.id === lens)) return lens as LeakId;
  if (typeof window === "undefined") return "supplier";
  const raw = new URLSearchParams(window.location.search).get("leak");
  if (raw && LEAKS.some((l) => l.id === raw)) return raw as LeakId;
  return "supplier";
}

export function Solutions2030(props: Props = {}) {
  const reduced = useReducedMotion();
  const [id, setId] = useState<LeakId>(() => readLeak(props.lens));
  const leak = LEAKS.find((l) => l.id === id) ?? LEAKS[0]!;

  useEffect(() => {
    setId(readLeak(props.lens));
  }, [props.lens]);

  const select = useCallback((next: LeakId) => {
    setId(next);
    const url = new URL(window.location.href);
    url.searchParams.set("leak", next);
    window.history.replaceState(null, "", url.toString());
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      const idx = LEAKS.findIndex((l) => l.id === id);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        select(LEAKS[(idx + 1) % LEAKS.length]!.id);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        select(LEAKS[(idx - 1 + LEAKS.length) % LEAKS.length]!.id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [id, select]);

  const journeyCopy = [
    leak.signal,
    leak.cause,
    leak.exposure,
    leak.decision,
    leak.recovery,
    leak.verification,
  ];

  return (
    <div className="radr radr-mineral">
      <PublicNavbar />
      <div className="rx30 rx30--mockup">
        <main>
          <section
            className="rx30-bleed rx30-bleed--page"
            data-nav-theme="light"
            aria-labelledby="rx30-sol-title"
          >
            <SilkAtmosphere className="rx30-bleed-silk" />
            <div className="rx30-shell rx30-bleed-copy rx30-bleed-copy--solo">
              <p className="rx30-kicker">Where value leaks</p>
              <h1 id="rx30-sol-title" className="rx30-bleed-h1">
                Every leak has a <em>signal.</em>
              </h1>
              <p className="rx30-bleed-lead">
                Value quietly slips through invoices, settlements, cost,
                procurement, and perishable inventory. RADR surfaces the leak
                and carries it into a Decision.
              </p>
              <div className="rx30-ctas">
                <Link
                  href="/value-calculator"
                  className="rx30-btn rx30-btn-primary"
                >
                  Build your Value Map <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/product"
                  className="rx30-btn rx30-btn-ghost rx30-btn-ghost--solid"
                >
                  Explore Platform
                </Link>
              </div>
            </div>
          </section>

          <section className="rx30-connect" data-nav-theme="light">
            <div className="rx30-shell">
              <p className="rx30-kicker">Leak classes</p>
              <h2 className="rx30-h2">Five places value quietly leaves.</h2>
              <div className="rx30-leak-nav" role="tablist">
                {LEAKS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    role="tab"
                    data-on={id === l.id ? "true" : undefined}
                    aria-selected={id === l.id}
                    onClick={() => select(l.id)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              <div className="rx30-split rx30-sol-econ">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={leak.id}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? undefined : { opacity: 0, y: -6 }}
                    transition={stageSwap}
                  >
                    <p className="rx30-demo-label">Illustrative demo</p>
                    <h2 className="rx30-h2">{leak.title}</h2>

                    <div className="rx30-sol-econ-row" aria-label="Economics">
                      {leak.economics.map((e) => (
                        <div key={e.label} className="rx30-sol-econ-cell">
                          <span>{e.label}</span>
                          <strong>{e.value}</strong>
                        </div>
                      ))}
                    </div>

                    <ol className="rx30-pain-list rx30-sol-journey">
                      {JOURNEY.map((s, i) => (
                        <li key={s}>
                          <em>{String(i + 1).padStart(2, "0")}</em>
                          <div>
                            <strong>{s}</strong>
                            <span>{journeyCopy[i]}</span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </motion.div>
                </AnimatePresence>
                <div className="rx30-module-preview rx30-module-preview--leak">
                  <LeakExplorerCanvas
                    leak={leak.id}
                    label={leak.label}
                    outcome={leak.outcome}
                  />
                </div>
              </div>
            </div>
          </section>

          <section
            className="rx30-close rx30-close--saas"
            data-nav-theme="light"
          >
            <div className="rx30-shell rx30-close-inner">
              <h2 className="rx30-h2">See what’s leaking in your operation.</h2>
              <div className="rx30-ctas">
                <Link
                  href="/value-calculator"
                  className="rx30-btn rx30-btn-primary"
                >
                  Build my Value Map <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/product"
                  className="rx30-btn rx30-btn-ghost rx30-btn-ghost--solid"
                >
                  Explore Platform
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
