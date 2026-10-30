"use client";

/**
 * One large Platform preview — morphs by surface.
 * Distinct DEMO examples (not only D-1911).
 */

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  PUBLIC_HOTEL,
  PUBLIC_RESTAURANT,
  PUBLIC_SUPPLIER,
} from "@/lib/marketing/publicCanon";
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
  | "health";

type Props = {
  surface: SurfaceId;
  liveRenderer?: string;
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

function LiveSchematic({ mode }: { mode: string }) {
  return (
    <Shell title="Live · Mercer House" meta={`${mode} · illustrative`}>
      <p className="rx30-demo-label">Hotel readiness</p>
      <svg
        className="rx30-live-schematic"
        viewBox="0 0 320 160"
        role="img"
        aria-label="Simplified live spatial schematic"
      >
        <rect x="12" y="20" width="90" height="56" rx="8" data-state="ready" />
        <rect
          x="114"
          y="20"
          width="90"
          height="56"
          rx="8"
          data-state="pressure"
        />
        <rect x="216" y="20" width="90" height="56" rx="8" data-state="ready" />
        <rect
          x="12"
          y="90"
          width="90"
          height="56"
          rx="8"
          data-state="blocked"
        />
        <rect x="114" y="90" width="90" height="56" rx="8" data-state="ready" />
        <rect x="216" y="90" width="90" height="56" rx="8" data-state="watch" />
        <circle cx="159" cy="48" r="5" className="rx30-live-pulse-node" />
      </svg>
      <p className="rx30-global-note">
        {PUBLIC_HOTEL.actionLabel} · {PUBLIC_HOTEL.expectedFormatted} exposed
      </p>
    </Shell>
  );
}

function HealthDemo() {
  const [state, setState] = useState<HealthKey>("healthy");
  const h = HEALTH[state];

  return (
    <Shell title="Data Health" meta="PMS feed · illustrative">
      <p className="rx30-demo-label">Evidence freshness</p>
      <div className="rx30-health-toggles" role="tablist" aria-label="Feed health">
        {(Object.keys(HEALTH) as HealthKey[]).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            data-on={state === k ? "true" : undefined}
            aria-selected={state === k}
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

export function PlatformSurfacePreview({
  surface,
  liveRenderer = "Floor plan",
}: Props) {
  const reduced = useReducedMotion();

  let body: ReactNode;
  switch (surface) {
    case "live":
      body = <LiveSchematic mode={liveRenderer} />;
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
      body = (
        <Shell
          title={PUBLIC_RESTAURANT.displayName}
          meta={PUBLIC_RESTAURANT.clockLine}
        >
          <p className="rx30-demo-label">Control Center</p>
          <p className="rx30-decision-id">
            {PUBLIC_RESTAURANT.decisionId} · Needs you
          </p>
          <h3 className="rx30-decision-verb">
            {PUBLIC_RESTAURANT.actionLabel}
          </h3>
          <p className="rx30-decision-sit">{PUBLIC_RESTAURANT.situation}</p>
          <div className="rx30-decision-meta">
            <div>
              <span>Expected</span>
              <strong>{PUBLIC_RESTAURANT.expectedFormatted}</strong>
            </div>
            <div>
              <span>Confidence</span>
              <strong>{PUBLIC_RESTAURANT.confidencePct}%</strong>
            </div>
          </div>
        </Shell>
      );
  }

  return (
    <div className="rx30-plat-morph-shell">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={surface}
          layout
          initial={reduced ? false : { opacity: 0, y: 8, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            reduced ? undefined : { opacity: 0, y: -6, filter: "blur(2px)" }
          }
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
