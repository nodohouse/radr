"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";
import { Link } from "@/i18n/navigation";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import { NAV_ICONS } from "@/components/product/shell/navIcons";
import { PUBLIC_HOTEL } from "@/lib/marketing/publicCanon";
import { PUBLIC_RESTAURANT as venue } from "@/lib/marketing/publicCanon";
import "./product-showcase.css";
import { OperationsShowcase } from "./OperationsShowcase";

const SECTIONS = [
  "Control Center",
  "Decisions",
  "Intelligence",
  "Value",
] as const;
const NAVIGATION = [
  { id: "control-center", label: "Control Center", scene: 0 },
  { id: "live", label: "Live", surface: "live" },
  { id: "decisions", label: "Decisions", scene: 1 },
  { id: "service", label: "Operations", surface: "operations" },
  { id: "house", label: "Back of House", surface: "house" },
  { id: "intelligence", label: "Intelligence", scene: 2 },
  { id: "value", label: "Value", scene: 3 },
  { id: "memory", label: "Memory", surface: "memory" },
  { id: "data-health", label: "Data Health", surface: "health" },
  { id: "connections", label: "Connections", surface: "connections" },
] as const;

/** A synthetic product tour, never a live feed or an executable approval flow. */
export function ProductBriefPreview({
  variant = "decisions",
  active = true,
}: {
  variant?: "decisions" | "operations";
  active?: boolean;
} = {}) {
  const sections =
    variant === "operations"
      ? ["Restaurant Live", "Hotel Live", "Operations"]
      : SECTIONS;
  const [section, setSection] = useState(variant === "operations" ? 1 : 0);
  const [motionReady, setMotionReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const reduced = useReducedMotionSafe();
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const auto =
    active && motionReady && visible && documentVisible && reduced === false;

  useEffect(() => {
    setMotionReady(true);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );
    if (root.current) observer.observe(root.current);
    const onVisibility = () => setDocumentVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  useEffect(() => {
    if (!auto) return;
    const timer = window.setTimeout(
      () =>
        setSection(
          (current) => (current + 1) % (variant === "operations" ? 3 : 4),
        ),
      variant === "operations" ? 6500 : 4200,
    );
    return () => window.clearTimeout(timer);
  }, [auto, section, variant]);
  const location =
    variant === "operations" && section === 1
      ? PUBLIC_HOTEL.displayName
      : venue.displayName;
  function select(next: number) {
    setSection(next);
  }

  return (
    <div
      ref={root}
      className="rsc-tablet"
      data-variant={variant}
      data-running={auto ? "true" : undefined}
      aria-label="RADR interactive product showcase, illustrative demo"
    >
      <span className="rsc-camera" aria-hidden="true" />
      <div className="rsc-screen">
        <aside className="rsc-sidebar" aria-label="RADR workspace preview">
          <FrozenRadrLogo variant="mark" width={27} />
          <div className="rsc-workspace">
            <small>WORKSPACE</small>
            <strong>{location}</strong>
          </div>
          <nav aria-label="Product showcase sections">
            {NAVIGATION.map((item) => {
              const Icon = NAV_ICONS[item.id];
              const content = (
                <>
                  <Icon />
                  <span>{item.label}</span>
                </>
              );
              const scene =
                variant === "operations"
                  ? (
                      { live: 0, service: 2 } as Record<
                        string,
                        number | undefined
                      >
                    )[item.id]
                  : "scene" in item
                    ? item.scene
                    : undefined;
              return scene !== undefined ? (
                <button
                  key={item.id}
                  type="button"
                  id={`${id}-nav-${scene}`}
                  data-scene={scene}
                  aria-label={item.label}
                  aria-pressed={
                    section === scene ||
                    (variant === "operations" &&
                      item.id === "live" &&
                      section === 1)
                  }
                  aria-controls={`${id}-panel`}
                  onClick={() => select(scene)}
                  onKeyDown={(event) => {
                    if (
                      !["ArrowDown", "ArrowUp", "Home", "End"].includes(
                        event.key,
                      )
                    )
                      return;
                    event.preventDefault();
                    const navScenes =
                      variant === "operations" ? [0, 2] : [0, 1, 2, 3];
                    const position = navScenes.indexOf(scene);
                    const next =
                      event.key === "Home"
                        ? navScenes[0]!
                        : event.key === "End"
                          ? navScenes[navScenes.length - 1]!
                          : navScenes[
                              (position +
                                (event.key === "ArrowDown"
                                  ? 1
                                  : navScenes.length - 1)) %
                                navScenes.length
                            ]!;
                    select(next);
                    document.getElementById(`${id}-nav-${next}`)?.focus();
                  }}
                >
                  {content}
                </button>
              ) : (
                <Link
                  key={item.id}
                  aria-label={`Explore ${item.label}`}
                  href={`/product?surface=${"surface" in item ? item.surface : item.id === "control-center" ? "control" : item.id}`}
                >
                  {content}
                </Link>
              );
            })}
          </nav>
          <div className="rsc-sidebar-status">
            <i /> Your operating picture
          </div>
        </aside>
        <div className="rsc-chrome">
          <strong>{sections[section]}</strong>
          <span className="rsc-top-location">{location}</span>
          <span className="rsc-avatar">A</span>
        </div>
        <div
          className="rsc-stage"
          role="region"
          id={`${id}-panel`}
          aria-label={`${sections[section]} preview`}
          tabIndex={0}
        >
          {variant === "operations" ? (
            <OperationsShowcase section={section} onSectionChange={select} />
          ) : (
            <div key={section} className="rsc-scene" data-section={section}>
              <div className="rsc-heading">
                <div>
                  <p>{venue.displayName} · Dinner service</p>
                  <h3>
                    {
                      [
                        "Your operation, in focus.",
                        "One decision. The whole story.",
                        "See the trade-off first.",
                        "Expected is not verified.",
                      ][section]
                    }
                  </h3>
                </div>
                <span className="rsc-section-marker">
                  {String(section + 1).padStart(2, "0")} / 04
                </span>
              </div>
              {section === 0 ? (
                <>
                  <div className="rsc-metrics">
                    <div>
                      <span>Needs you</span>
                      <strong>01</strong>
                      <small>Decision to review</small>
                    </div>
                    <div>
                      <span>Confidence</span>
                      <strong>{venue.confidencePct}%</strong>
                      <small>Illustrative estimate</small>
                    </div>
                    <div>
                      <span>Expected protected</span>
                      <strong>{venue.expectedFormatted}</strong>
                      <small>Tonight · modeled</small>
                    </div>
                  </div>
                  <div className="rsc-chart">
                    <div>
                      <span>Service pressure</span>
                      <span className="rsc-chart-key">
                        <i /> Demand <b /> Capacity
                      </span>
                    </div>
                    <svg
                      viewBox="0 0 480 100"
                      preserveAspectRatio="none"
                      role="img"
                      aria-label="Animated illustrative demand rising above planned kitchen capacity"
                    >
                      <path
                        className="rsc-grid"
                        d="M0 25H480M0 50H480M0 75H480"
                      />
                      <path className="rsc-capacity" d="M0 58H480" />
                      <path
                        className="rsc-area"
                        d="M0 86 40 77 80 81 120 61 160 66 200 48 240 56 280 29 320 40 360 16 400 27 440 8 480 16V100H0Z"
                      />
                      <path
                        pathLength="1"
                        className="rsc-line"
                        d="M0 86 40 77 80 81 120 61 160 66 200 48 240 56 280 29 320 40 360 16 400 27 440 8 480 16"
                      />
                      <circle
                        className="rsc-chart-tip"
                        cx="480"
                        cy="16"
                        r="4"
                      />
                    </svg>
                    <div>
                      <small>19:00</small>
                      <small>19:30</small>
                      <small>20:00 · modeled</small>
                    </div>
                  </div>
                  <div className="rsc-decision">
                    <span className="rsc-signal">
                      NEEDS YOU · {venue.decisionId}
                    </span>
                    <h4>Pace the next seating wave.</h4>
                    <p>Demand is ahead of plan. Give the kitchen 12 minutes.</p>
                    <button
                      type="button"
                      className="rsc-action"
                      onClick={() => select(1)}
                    >
                      Review the decision <span>→</span>
                    </button>
                  </div>
                </>
              ) : section === 1 ? (
                <>
                  <div className="rsc-decision">
                    <span className="rsc-signal">
                      EVIDENCE · {venue.decisionId}
                    </span>
                    <h4>Twelve minutes to protect tonight.</h4>
                    <p>
                      Seating demand and kitchen capacity point to the same
                      constraint. Review the evidence before choosing a
                      response.
                    </p>
                  </div>
                  <div className="rsc-evidence">
                    <div>
                      <span>01</span>
                      <div>
                        <strong>Reservations</strong>
                        <p>The next seating wave is approaching.</p>
                      </div>
                    </div>
                    <div>
                      <span>02</span>
                      <div>
                        <strong>Kitchen capacity</strong>
                        <p>The kitchen is the service constraint.</p>
                      </div>
                    </div>
                    <div>
                      <span>03</span>
                      <div>
                        <strong>
                          Decision confidence · {venue.confidencePct}%
                        </strong>
                        <p>Confidence based on the demo evidence.</p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rsc-action"
                    onClick={() => select(2)}
                  >
                    Compare the two futures <span>→</span>
                  </button>
                </>
              ) : section === 2 ? (
                <>
                  <p className="rsc-intro">
                    Same restaurant. Same dinner rush. Two possible next moves.
                  </p>
                  <div className="rsc-futures">
                    <div>
                      <span>Alternative</span>
                      <h4>Keep seating</h4>
                      <p>Accept the next wave. Kitchen pressure remains.</p>
                      <strong>Baseline</strong>
                      <small>No incremental protected value assumed.</small>
                      <i style={{ width: "44%" }} />
                    </div>
                    <div data-recommended="true">
                      <span>Recommended · demo</span>
                      <h4>Pace 12 minutes</h4>
                      <p>Give the kitchen room to absorb the next wave.</p>
                      <strong>{venue.expectedFormatted}</strong>
                      <small>
                        Expected protected tonight · {venue.confidencePct}%
                        confidence
                      </small>
                      <i style={{ width: "86%" }} />
                    </div>
                  </div>
                  <p className="rsc-note">
                    Compare modeled outcomes before choosing a response.
                  </p>
                  <button
                    type="button"
                    className="rsc-action"
                    onClick={() => select(3)}
                  >
                    See the illustrative outcome <span>→</span>
                  </button>
                </>
              ) : (
                <>
                  <p className="rsc-intro">
                    A separate completed-service example for {venue.decisionId}.
                    Expected and verified value stay distinct.
                  </p>
                  <div className="rsc-value">
                    <span>Illustrative completed-service outcome</span>
                    <strong>{venue.verifiedFormatted}</strong>
                    <h4>Protected tonight.</h4>
                    <p>Completed-service example · demo data.</p>
                  </div>
                  <div className="rsc-proof">
                    <span>Decision recorded</span>
                    <span>Outcome compared</span>
                    <span>Demo evidence trail</span>
                  </div>
                  <Link href="/demo" className="rsc-action">
                    Explore the interactive demo <span>↗</span>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
        <div className="rsc-foot">
          <span>
            <i /> Product preview · synthetic data
          </span>
          <span className="rsc-tour-progress" aria-hidden="true">
            <i key={section} />
          </span>
        </div>
      </div>
    </div>
  );
}
