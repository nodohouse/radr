"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  displayOrgName,
  displayPrimaryLocation,
  readWorkspaceBrand,
} from "@/lib/onboarding/brand";
import { trackOnboarding } from "@/lib/onboarding/analytics";

const TOUR = [
  {
    title: "This is your Control Center",
    body: "Anything requiring attention appears here first.",
  },
  {
    title: "RADR watches four territories",
    body: "BUY what you spend. LABOR how you staff. SELL how you monetize. RECOVER what you’re owed.",
  },
  {
    title: "Every finding has a value",
    body: "RADR estimates financial impact so you know what deserves attention first.",
  },
  {
    title: "Ask RADR",
    body: "Ask your operation in plain language - for example, “What should I worry about tonight?”",
  },
] as const;

export function FirstSessionOverlay() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const welcome = search.get("welcome") === "1";
  const [phase, setPhase] = useState<"welcome" | "tourAsk" | "tour" | "hidden">(
    "hidden",
  );
  const [tourIdx, setTourIdx] = useState(0);
  const [branded, setBranded] = useState(false);

  useEffect(() => {
    const brand = readWorkspaceBrand();
    setBranded(Boolean(brand?.demo && brand.orgName));
    if (!welcome) return;
    if (typeof window !== "undefined") {
      const seen = sessionStorage.getItem("radr.firstWelcome");
      if (seen) {
        setPhase("hidden");
        return;
      }
    }
    setPhase("welcome");
    trackOnboarding("control_center_viewed");
  }, [welcome]);

  function clearWelcomeParam() {
    const url = new URL(window.location.href);
    url.searchParams.delete("welcome");
    router.replace(url.pathname + url.search);
  }

  function dismissWelcome(next: "tourAsk" | "hidden") {
    sessionStorage.setItem("radr.firstWelcome", "1");
    setPhase(next);
    if (next === "hidden") clearWelcomeParam();
  }

  if (phase === "hidden") return null;
  if (pathname !== "/app" && !pathname.startsWith("/app/")) return null;

  const org = displayOrgName();
  const loc = displayPrimaryLocation();

  if (phase === "welcome") {
    return (
      <div className="ob-first" role="dialog" aria-modal="true" aria-labelledby="ob-first-title">
        <div className="ob-first-card">
          <p className="ob-kicker">Welcome to RADR</p>
          <h2 id="ob-first-title" className="ob-title" style={{ marginBottom: "0.5rem" }}>
            {branded ? `${org}` : "Your control center"}
          </h2>
          <p className="ob-copy">
            RADR watches your operation and surfaces what deserves your attention.
            {branded ? (
              <>
                {" "}
                Showing <strong>DEMO DATA</strong> styled for {loc}.
              </>
            ) : null}
          </p>
          <div className="ob-first-metrics">
            <div>
              <strong>€1,240</strong>
              <span>Value identified</span>
            </div>
            <div>
              <strong>3</strong>
              <span>Items need attention</span>
            </div>
            <div>
              <strong>€620</strong>
              <span>Recoverable</span>
            </div>
          </div>
          <ul className="ob-first-findings">
            <li>
              <em>LABOR</em>
              Dinner service is likely understaffed.
            </li>
            <li>
              <em>SELL</em>
              A cancellation created recoverable inventory.
            </li>
            <li>
              <em>BUY</em>
              Produce pricing is above contracted terms.
            </li>
          </ul>
          <button
            type="button"
            className="ob-btn ob-btn-primary"
            onClick={() => dismissWelcome("tourAsk")}
          >
            Show me <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    );
  }

  if (phase === "tourAsk") {
    return (
      <div className="ob-tour-ask" role="dialog" aria-label="Optional tour">
        <p>Want the 60-second tour?</p>
        <div>
          <button
            type="button"
            className="ob-btn ob-btn-primary"
            onClick={() => {
              trackOnboarding("tour_started");
              setPhase("tour");
              setTourIdx(0);
            }}
          >
            Show me around
          </button>
          <button
            type="button"
            className="ob-btn ob-btn-ghost"
            onClick={() => {
              trackOnboarding("tour_dismissed");
              dismissWelcome("hidden");
            }}
          >
            I&apos;ll explore
          </button>
        </div>
      </div>
    );
  }

  const step = TOUR[tourIdx]!;
  return (
    <div className="ob-tour" role="dialog" aria-modal="true">
      <div className="ob-tour-card">
        <p className="ob-step">
          {tourIdx + 1} / {TOUR.length}
        </p>
        <h2 className="ob-title" style={{ fontSize: "1.35rem" }}>
          {step.title}
        </h2>
        <p className="ob-copy">{step.body}</p>
        <div className="ob-actions" style={{ marginTop: "1rem" }}>
          <button
            type="button"
            className="ob-btn ob-btn-primary"
            onClick={() => {
              if (tourIdx >= TOUR.length - 1) {
                dismissWelcome("hidden");
                return;
              }
              setTourIdx((i) => i + 1);
            }}
          >
            {tourIdx >= TOUR.length - 1 ? "Done" : "Next →"}
          </button>
          <button
            type="button"
            className="ob-btn ob-btn-ghost"
            onClick={() => dismissWelcome("hidden")}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
