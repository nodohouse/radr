"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { isSyntheticData, getRadrEnvironment } from "@/lib/radr/env";

type Step = {
  title: string;
  body: string;
  why: string;
  href: string;
  highlight?: string;
};

const STEP_KEY = "radr-tour-step";
const DISMISS_KEY = "radr.tour.dismissed";

/** Dense, non-blocking tutorial - one concept per step. */
const STEPS: Step[] = [
  {
    title: "Glance first",
    body: "2 seconds: what needs you. 5 seconds: what to do. Detail is one tap away.",
    why: "Hospitality is physical - RADR compresses by role.",
    href: "/app",
    highlight: ".rp-os-headline, [data-tour-target='hero']",
  },
  {
    title: "Role lens",
    body: "Chef sees portions. CFO sees euros. Host sees moments. Same truth.",
    why: "Switch Viewing as to feel each operating brief.",
    href: "/app",
    highlight: ".rp-role-switch",
  },
  {
    title: "Service phase",
    body: "Pre-shift prepares. Live intervenes. Post-shift proves.",
    why: "RADR follows the shift - not a static dashboard.",
    href: "/app",
    highlight: ".rp-phase-strip, .rp-pov, [data-phase]",
  },
  {
    title: "Priority queue",
    body: "Ordered by importance. Commercial risk and safety look different on purpose.",
    why: "You approve the move - you don’t rebuild the answer.",
    href: "/app",
    highlight: ".rp-os-item, .rp-os-queue",
  },
  {
    title: "Deep when needed",
    body: "Tap Source / Brief / Confirm for plan, hospitality, and proof.",
    why: "Sophistication stays in the backend and drawers.",
    href: "/app",
    highlight: ".rp-os-cta, .rp-os-item .rp-os-cta",
  },
];

function progressLabel(index: number) {
  return `${index + 1}/${STEPS.length}`;
}

function readStored(): number {
  try {
    const raw = sessionStorage.getItem(STEP_KEY);
    if (raw == null) return 0;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 && n < STEPS.length ? n : 0;
  } catch {
    return 0;
  }
}

function writeStored(n: number) {
  try {
    sessionStorage.setItem(STEP_KEY, String(n));
  } catch {
    /* ignore */
  }
}

export function GuidedDemoTour() {
  const pathname = usePathname() || "/app";
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const demo = isSyntheticData(getRadrEnvironment());

  useEffect(() => {
    setIndex(readStored());
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
    setReady(true);
  }, []);

  const step = STEPS[index]!;

  useEffect(() => {
    if (!ready || dismissed || !demo) return;
    writeStored(index);
  }, [index, ready, dismissed, demo]);

  useLayoutEffect(() => {
    if (!ready || dismissed || !demo) return;
    document.documentElement.dataset.tourStep = String(index + 1);
    const selectors = (step.highlight ?? "").split(",").map((s) => s.trim());
    let el: Element | null = null;
    for (const sel of selectors) {
      if (!sel) continue;
      el = document.querySelector(sel);
      if (el) break;
    }
    el?.setAttribute("data-tour-hl", "true");
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    return () => {
      delete document.documentElement.dataset.tourStep;
      el?.removeAttribute("data-tour-hl");
    };
  }, [ready, dismissed, demo, step.highlight, pathname, index]);

  if (!demo || !ready || dismissed) return null;

  function go(nextIndex: number) {
    const next = Math.max(0, Math.min(STEPS.length - 1, nextIndex));
    setIndex(next);
    writeStored(next);
    const target = STEPS[next]!.href;
    if (pathname !== target) router.push(target);
  }

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  return (
    <aside
      className="rp-coach rp-coach-dock"
      role="region"
      aria-label="RADR tutorial"
    >
      <header className="rp-coach-head">
        <p className="rp-coach-kicker">TUTORIAL · {progressLabel(index)}</p>
        <button
          type="button"
          className="rp-coach-close"
          aria-label="Dismiss"
          onClick={dismiss}
        >
          ×
        </button>
      </header>
      <p className="rp-coach-title">{step.title}</p>
      <p className="rp-coach-block-body">{step.body}</p>
      <div className="rp-coach-block">
        <p className="rp-coach-block-label">The point</p>
        <p className="rp-coach-block-body">{step.why}</p>
      </div>
      <div className="rp-coach-actions">
        <button
          type="button"
          className="rp-coach-btn"
          onClick={() => go(index - 1)}
          disabled={index === 0}
        >
          Back
        </button>
        {index < STEPS.length - 1 ? (
          <button
            type="button"
            className="rp-coach-btn rp-coach-btn-primary"
            onClick={() => go(index + 1)}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            className="rp-coach-btn rp-coach-btn-primary"
            onClick={dismiss}
          >
            Done
          </button>
        )}
        <button type="button" className="rp-coach-skip" onClick={dismiss}>
          Skip
        </button>
      </div>
    </aside>
  );
}
