"use client";
import { ProductBriefPreview } from "./ProductBriefPreview";
import dynamic from "next/dynamic";

/**
 * One large Platform preview — morphs by surface.
 * Distinct DEMO examples (not only D-1911).
 */

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PUBLIC_SUPPLIER } from "@/lib/marketing/publicCanon";
import { stageSwap } from "@/lib/marketing/motion";
import { ProductDecisionCanvas } from "@/components/marketing/v2030/ProductDecisionCanvas";

export type SurfaceId =
  | "control"
  | "live"
  | "decisions"
  | "operations"
  | "intelligence"
  | "value"
  | "memory"
  | "health"
  | "house"
  | "connections";

type Props = {
  surface: SurfaceId;
};

const HEALTH = {
  healthy: {
    label: "Healthy",
    confidence: 82,
    action: "Recommend / request approval",
  },
  degraded: {
    label: "Degraded",
    confidence: 61,
    action: "Prepare only · human required",
  },
  stale: {
    label: "Stale",
    confidence: 48,
    action: "High-risk action blocked",
  },
} as const;

type HealthKey = keyof typeof HEALTH;

function Shell({
  title,
  meta,
  children,
}: {
  title: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <div className="rx30-surf">
      <header className="rx30-surf-chrome">
        <strong>{title}</strong>
        <span>{meta}</span>
      </header>
      <div className="rx30-surf-body">{children}</div>
    </div>
  );
}

const LivePreview = dynamic(() => import("./PlatformLivePreview"), {
  loading: () => (
    <div className="psw-loading" role="status">
      <span />
      Opening the operating view
    </div>
  ),
});

function HealthDemo() {
  const [state, setState] = useState<HealthKey>("healthy");
  const h = HEALTH[state];

  return (
    <Shell title="Data Health" meta="PMS feed · illustrative">
      <p className="rx30-demo-label">Evidence freshness</p>
      <div
        className="rx30-health-toggles"
        role="group"
        aria-label="Feed health"
      >
        {(Object.keys(HEALTH) as HealthKey[]).map((k) => (
          <button
            key={k}
            type="button"
            data-on={state === k ? "true" : undefined}
            aria-pressed={state === k}
            onClick={() => setState(k)}
          >
            {HEALTH[k].label}
          </button>
        ))}
      </div>
      <div className="rx30-health-readout">
        <div>
          <span>Confidence</span>
          <strong>{h.confidence}%</strong>
        </div>
        <div>
          <span>Allowed action</span>
          <strong>{h.action}</strong>
        </div>
      </div>
    </Shell>
  );
}

function ValueDemo() {
  return (
    <Shell title="Value" meta={`${PUBLIC_SUPPLIER.displayId} · illustrative`}>
      <p className="rx30-demo-label">Supplier recovery</p>
      <div className="rx30-verify-rail" aria-label="Value states">
        <div data-state="expected">
          <span>Expected</span>
          <strong>{PUBLIC_SUPPLIER.varianceFormatted}</strong>
        </div>
        <div data-state="observed">
          <span>Observed</span>
          <strong>{PUBLIC_SUPPLIER.invoiceFormatted}</strong>
        </div>
        <div data-state="verified">
          <span>Verified</span>
          <strong>{PUBLIC_SUPPLIER.verifiedFormatted}</strong>
        </div>
      </div>
      <p className="rx30-act-badge">
        Evidence sealed · {PUBLIC_SUPPLIER.displayId}
      </p>
    </Shell>
  );
}

function MemoryDemo() {
  return (
    <Shell title="Operating Memory" meta="Friday peak playbook">
      <p className="rx30-demo-label">Comparable evidence</p>
      <svg className="rx30-memory-net" viewBox="0 0 280 120" aria-hidden="true">
        <line x1="40" y1="60" x2="120" y2="30" />
        <line x1="40" y1="60" x2="120" y2="90" />
        <line x1="120" y1="30" x2="200" y2="50" />
        <line x1="120" y1="90" x2="200" y2="50" />
        <line x1="200" y1="50" x2="250" y2="50" />
        <circle cx="40" cy="60" r="7" />
        <circle cx="120" cy="30" r="6" />
        <circle cx="120" cy="90" r="6" />
        <circle cx="200" cy="50" r="8" data-on="true" />
        <circle cx="250" cy="50" r="5" data-on="true" />
      </svg>
      <p className="rx30-act-badge">Playbook updated · Friday peaks</p>
    </Shell>
  );
}

export function PlatformSurfacePreview({ surface }: Props) {
  const reduced = useReducedMotion();

  let body: ReactNode;
  switch (surface) {
    case "house":
      body = (
        <Shell title="Back of House" meta="Illustrative field workflow">
          <div className="rm-field-preview">
            <p className="rm-tag">OBSERVATION → REVIEW → OPERATING CONTEXT</p>
            <h3>Bring the storeroom into the picture.</h3>
            <p>
              Capture an observation, attach source evidence, and route it for
              review. Stock notes and room-readiness checks support the
              operating model.
            </p>
            <div className="rm-evidence-chain">
              <span>Record a stock note</span>
              <b>→</b>
              <span>Review evidence</span>
              <b>→</b>
              <span>Update context</span>
            </div>
            <small>
              Camera and voice capture are a workflow preview. No inventory
              change is posted from this illustration.
            </small>
          </div>
        </Shell>
      );
      break;
    case "connections":
      body = (
        <Shell title="Connections" meta="Evidence before execution">
          <div className="rm-field-preview">
            <p className="rm-tag">SOURCE READINESS</p>
            <h3>Your systems. One evidence layer.</h3>
            <p>
              Connection health, freshness, and permissions determine how much a
              Decision can rely on a source.
            </p>
            <div className="rm-lens-grid">
              {[
                "POS & payments",
                "PMS & reservations",
                "Labor & scheduling",
                "Invoices & purchasing",
              ].map((source) => (
                <div key={source}>
                  <strong>{source}</strong>
                  <p>Review access, freshness, and available evidence.</p>
                </div>
              ))}
            </div>
            <small>
              Representative system categories. Actual connector availability
              and write permissions depend on the agreed setup.
            </small>
          </div>
        </Shell>
      );
      break;
    case "live":
      body = <LivePreview />;
      break;
    case "value":
      body = <ValueDemo />;
      break;
    case "memory":
      body = <MemoryDemo />;
      break;
    case "health":
      body = <HealthDemo />;
      break;
    case "decisions":
      body = <ProductDecisionCanvas stage="decide" cinematic />;
      break;
    case "operations":
      body = (
        <ProductDecisionCanvas world="hotel" stage="understand" cinematic />
      );
      break;
    case "intelligence":
      body = <ProductDecisionCanvas stage="understand" cinematic />;
      break;
    default:
      body = <ProductBriefPreview active={false} />;
  }

  return (
    <div className="rx30-plat-morph-shell">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={surface}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -4 }}
          transition={{
            ...stageSwap,
            duration: reduced ? 0 : 0.38,
          }}
        >
          {body}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
