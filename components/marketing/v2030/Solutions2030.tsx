"use client";
import { EconomicLensPage } from "./EconomicLensPage";
import { SolutionFieldNotes, EconomicLensOverview } from "./BuyerGuide";
import { economicGuideId } from "@/lib/marketing/buyerGuide";
import { MarketingHeroVisual } from "./MarketingHeroVisual";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";
import { Link } from "@/i18n/navigation";
import { PublicFooter, PublicNavbar } from "@/components/marketing/PublicShell";
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
import "@/app/marketing-premium-pages.css";

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
    title: "When sales and settlements do not match",
    signal: "POS expectation and payment settlement disagree.",
    cause: "Unexplained gap ages before anyone owns it.",
    exposure: "Material unexplained gap",
    decision: "Match the sales, fees, refunds and expected receipt.",
    recovery: "Assign an owner to explain or resolve the remaining difference.",
    verification: "Receipt or adjustment matched to the original records",
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
    title: "Understand what changed the food cost",
    signal: "Food cost and yield drift vs plan.",
    cause: "Separate changes in purchase price, portion size, yield and waste.",
    exposure: "Margin at risk this period",
    decision:
      "Compare a purchasing or preparation change and its service impact.",
    recovery: "Review the proposed change before applying it to the operation.",
    verification: "Observed cost vs expected after action",
    economics: [
      { label: "Plan", value: "Baseline" },
      { label: "Actual", value: "Drift" },
      { label: "Driver", value: "Ranked" },
    ],
    outcome: "Purchasing or preparation response compared",
  },
  {
    id: "proc",
    label: "Procurement",
    title: "Supplier price dispersion",
    signal: "Same item, different cities, different unit economics.",
    cause: "Material dispersion across the estate.",
    exposure: "Comparable purchasing cost this period",
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
    decision:
      "Compare timing, pricing and channel responses, including doing nothing.",
    recovery:
      "Review the contribution and operating constraints of each response.",
    verification:
      "Recorded contribution compared with the expectation after service",
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

const HASH_LEAK: Record<string, LeakId> = {
  "supplier-ap": "supplier",
  reconciliation: "recon",
  "cost-variance": "cost",
  procurement: "proc",
  perishable: "perish",
};

function readLeak(lens?: string): LeakId {
  if (lens && LEAKS.some((l) => l.id === lens)) return lens as LeakId;
  if (typeof window === "undefined") return "supplier";
  const raw = new URLSearchParams(window.location.search).get("leak");
  if (raw && LEAKS.some((l) => l.id === raw)) return raw as LeakId;
  return HASH_LEAK[window.location.hash.slice(1)] ?? "supplier";
}

export function Solutions2030(props: Props = {}) {
  const lens = economicGuideId(props.lens);
  return lens ? (
    <EconomicLensPage lens={lens} />
  ) : (
    <SolutionsOverview {...props} />
  );
}

function SolutionsOverview(props: Props) {
  const reduced = useReducedMotionSafe();
  const [id, setId] = useState<LeakId>(() =>
    LEAKS.some((l) => l.id === props.lens)
      ? (props.lens as LeakId)
      : "supplier",
  );
  const leak = LEAKS.find((l) => l.id === id) ?? LEAKS[0]!;

  useEffect(() => {
    const sync = () => {
      setId(readLeak(props.lens));
      if (HASH_LEAK[window.location.hash.slice(1)])
        document
          .getElementById("value-leaks")
          ?.scrollIntoView({ block: "start" });
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [props.lens]);

  const select = useCallback((next: LeakId) => {
    setId(next);
    const url = new URL(window.location.href);
    url.searchParams.set("leak", next);
    window.history.replaceState(null, "", url.toString());
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.target instanceof Element) || !e.target.closest(".rx30-leak-nav"))
        return;
      const idx = LEAKS.findIndex((l) => l.id === id);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = LEAKS[(idx + 1) % LEAKS.length]!.id;
        select(next);
        document.getElementById(`leak-tab-${next}`)?.focus();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const next = LEAKS[(idx - 1 + LEAKS.length) % LEAKS.length]!.id;
        select(next);
        document.getElementById(`leak-tab-${next}`)?.focus();
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
    <div className="radr radr-mineral rm-premium">
      <PublicNavbar />
      <div className="rx30 rx30--mockup">
        <main>
          <section
            className="rx30-bleed rx30-bleed--page rm-page-hero-grid"
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
            <MarketingHeroVisual kind="solutions" />
          </section>

          <section
            id="value-leaks"
            className="rx30-connect"
            data-nav-theme="light"
          >
            <div className="rx30-shell">
              <p className="rx30-kicker">Leak classes</p>
              <h2 className="rx30-h2">Five places value quietly leaves.</h2>
              <div
                className="rx30-leak-nav"
                role="tablist"
                aria-label="Explore economic problems"
              >
                {LEAKS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    role="tab"
                    id={`leak-tab-${l.id}`}
                    aria-controls="leak-preview"
                    tabIndex={id === l.id ? 0 : -1}
                    data-on={id === l.id ? "true" : undefined}
                    aria-selected={id === l.id}
                    onClick={() => select(l.id)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              <div
                id="leak-preview"
                role="tabpanel"
                aria-labelledby={`leak-tab-${id}`}
                tabIndex={0}
                className="rx30-split rx30-sol-econ"
              >
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
              <SolutionFieldNotes id={leak.id} />
            </div>
          </section>

          <EconomicLensOverview />

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
