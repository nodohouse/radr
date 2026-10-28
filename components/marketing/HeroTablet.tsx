"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  useInView,
} from "motion/react";
import "./hero-tablet.css";

const ease = [0.22, 1, 0.36, 1] as const;
const sharedTransition = { duration: 0.55, ease };
type Phase = "control" | "decision" | "action" | "value";
const destinations = [
  "Control Center",
  "Live",
  "Decisions",
  "Operations",
  "Intelligence",
  "Value",
  "Memory",
  "Data Health",
];
const subscribeMedia = (query: string, listener: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
};
const subscribeReduced = (listener: () => void) =>
  subscribeMedia("(prefers-reduced-motion: reduce)", listener);
const getReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const subscribeMobile = (listener: () => void) =>
  subscribeMedia("(max-width: 700px)", listener);
const getMobile = () => window.matchMedia("(max-width: 700px)").matches;

const subscribeVisibility = (listener: () => void) => {
  document.addEventListener("visibilitychange", listener);
  return () => document.removeEventListener("visibilitychange", listener);
};
const getForeground = () => document.visibilityState !== "hidden";

const subscribeScroll = (listener: () => void) => {
  window.addEventListener("scroll", listener, { passive: true });
  return () => window.removeEventListener("scroll", listener);
};
const getScrollY = () => window.scrollY;

function ControlCenter({
  reduced,
  chart,
  attention,
}: {
  reduced: boolean;
  chart: boolean;
  attention: boolean;
}) {
  return (
    <>
      <div className="rh-greeting">
        <span className="rh-demo-label">CONTROL CENTER</span>
        <h2>Good morning, Alex.</h2>
        <p>Here’s what needs your attention today.</p>
      </div>
      <div className="rh-metrics">
        {[
          {
            value: "3",
            label: "Decisions",
            sub: "need attention",
            link: "See decisions",
            icon: "●",
          },
          {
            value: "$12.4K",
            label: "Estimated opportunity",
            sub: "",
            link: "View details",
            icon: "",
          },
          {
            value: "+8%",
            label: "RevPASH lift",
            sub: "potential",
            link: "See performance",
            icon: "◈",
          },
        ].map((m) => (
          <div className="rh-metric" key={m.value}>
            <span className="rh-metric-status">{m.icon}</span>
            <strong>{m.value}</strong>
            <span>
              {m.label}
              <br />
              {m.sub}
            </span>
            <small>{m.link} →</small>
          </div>
        ))}
      </div>
      <div className="rh-dashboard-bottom">
        <div className="rh-chart">
          <h3>
            Revenue opportunity <span>This week ⌄</span>
          </h3>
          <div className="rh-chart-inner">
            <svg
              viewBox="0 0 360 155"
              role="img"
              aria-label="Illustrative revenue opportunity rising over the week"
            >
              <defs>
                <linearGradient id="rhArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#43cba3" stopOpacity=".55" />
                  <stop offset="100%" stopColor="#43cba3" stopOpacity=".03" />
                </linearGradient>
                <linearGradient id="rhBar" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#29b48b" />
                  <stop offset="1" stopColor="#c9eee0" />
                </linearGradient>
              </defs>
              {[30, 65, 100, 135].map((y) => (
                <path
                  key={y}
                  d={`M0 ${y}H325`}
                  stroke="#d7dfda"
                  strokeWidth=".7"
                />
              ))}
              <path
                d="M0 135 L30 128 L63 115 L94 118 L126 95 L157 101 L188 113 L220 102 L252 66 L283 73 L315 55 V140H0Z"
                fill="url(#rhArea)"
              />
              <motion.path
                initial={false}
                animate={{
                  pathLength: reduced || chart ? 1 : 0.82,
                  opacity: reduced || chart ? 1 : 0.7,
                }}
                transition={{ duration: reduced ? 0 : 0.65, ease }}
                d="M0 135 L30 128 L63 115 L94 118 L126 95 L157 101 L188 113 L220 102 L252 66 L283 73 L315 55"
                fill="none"
                stroke="#49bd9b"
                strokeWidth="2"
              />
              {[120, 105, 110, 90, 98, 112, 100, 68, 75, 58].map((y, i) => (
                <rect
                  key={i}
                  x={i * 31 + 5}
                  y={y}
                  width="16"
                  height={140 - y}
                  fill="url(#rhBar)"
                />
              ))}
              <g fill="#6b7973" fontSize="10">
                <text x="335" y="34">
                  $40K
                </text>
                <text x="335" y="101">
                  $20K
                </text>
                <text x="335" y="140">
                  $0
                </text>
              </g>
            </svg>
            <div className="rh-days">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
          </div>
        </div>
        <motion.div
          className="rh-signal"
          layoutId="hero-supplier-signal"
          transition={sharedTransition}
          animate={{ y: !reduced && attention ? -3 : 0 }}
        >
          <h3>Top signal</h3>
          <div className="rh-signal-content">
            <span className="rh-signal-icon">▤</span>
            <div>
              <strong>
                Supplier variance
                <br />
                detected
              </strong>
              <p>Across 3 locations</p>
              <span>
                Review recommended
                <br />
                action →
              </span>
            </div>
          </div>
          <div className="rh-signal-footer">
            <span className="rh-status-dot" /> Evidence connected
          </div>
        </motion.div>
      </div>
    </>
  );
}

export function HeroTablet() {
  const device = useRef<HTMLDivElement>(null);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    getReduced,
    () => true,
  );
  const mobile = useSyncExternalStore(subscribeMobile, getMobile, () => false);
  const visible = useInView(device, { amount: 0.15 });
  const foreground = useSyncExternalStore(
    subscribeVisibility,
    getForeground,
    () => true,
  );
  const [frame, setFrame] = useState({ phase: "control" as Phase, beat: 0 });
  const elapsed = useRef(0);
  const seekTarget = useRef<number | null>(null);
  const [seek, setSeek] = useState(0);
  const [paused, setPaused] = useState(false);
  const scrollY = useSyncExternalStore(subscribeScroll, getScrollY, () => 0);
  const running =
    !reduced &&
    visible &&
    foreground &&
    !paused &&
    scrollY < (mobile ? 560 : 60);
  useEffect(() => {
    if (!running) return;
    const duration = mobile ? 7000 : 9000;
    const marks = [
      0,
      500,
      1500,
      2700,
      3300,
      3450,
      3630,
      3810,
      ...(mobile ? [] : [4500, 5600]),
      duration,
    ];
    const started = performance.now();
    const initial = (seekTarget.current ?? elapsed.current) % duration;
    seekTarget.current = null;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const ms = (initial + performance.now() - started) % duration;
      const phase: Phase =
        ms < 2700
          ? "control"
          : !mobile && ms >= 5600
            ? "value"
            : !mobile && ms >= 4500
              ? "action"
              : "decision";
      const beat =
        ms < 500
          ? 0
          : ms < 1500
            ? 1
            : ms < 2700
              ? 2
              : ms < 3300
                ? 3
                : ms < 3450
                  ? 4
                  : ms < 3630
                    ? 5
                    : ms < 3810
                      ? 6
                      : 7;
      setFrame({ phase, beat });
      const next = marks.find((mark) => mark > ms) ?? duration;
      timer = setTimeout(tick, Math.max(1, next - ms + 2));
    };
    tick();
    return () => {
      clearTimeout(timer);
      if (seekTarget.current === null)
        elapsed.current = (initial + performance.now() - started) % duration;
    };
  }, [running, mobile, seek]);
  const phase = reduced
    ? "control"
    : mobile && (frame.phase === "action" || frame.phase === "value")
      ? "decision"
      : frame.phase;
  const jump = (destination: Phase) => {
    elapsed.current =
      destination === "control" ? 0 : destination === "decision" ? 2700 : 5600;
    seekTarget.current = elapsed.current;
    setFrame({ phase: destination, beat: destination === "control" ? 0 : 7 });
    setSeek((n) => n + 1);
  };
  return (
    <div
      ref={device}
      className="rh-device"
      data-motion={reduced ? "reduced" : "full"}
      data-signal-active={
        !reduced && frame.beat === 2 && phase === "control" ? "true" : "false"
      }
      data-playing={running}
      aria-label="RADR product preview with illustrative data"
    >
      <MotionConfig reducedMotion="user">
        <LayoutGroup id="hero-tablet">
          <div className="rh-dashboard">
            <aside className="rh-sidebar">
              <Image
                src="/brand/radr-wordmark-clean-monochrome-black.svg"
                width={83}
                height={20}
                alt="RADR"
              />
              <div className="rh-workspace">
                WORKSPACE <span>⌄</span>
              </div>
              <div className="rh-side-items">
                {destinations.map((name, i) => (
                  <div
                    key={name}
                    className={
                      (
                        phase === "control"
                          ? i === 0
                          : phase === "value"
                            ? name === "Value"
                            : name === "Decisions"
                      )
                        ? "selected"
                        : ""
                    }
                  >
                    <span aria-hidden="true">
                      {["▣", "◉", "◎", "▤", "◈", "◇", "▥", "◌"][i]}
                    </span>
                    {name}
                  </div>
                ))}
              </div>
              <div className="rh-sidebar-bottom">
                <span className="rh-status-dot" /> All systems connected
              </div>
            </aside>
            <div className="rh-main">
              <div className="rh-toolbar">
                <span className="rh-search">
                  ⌕ <span>Search anything...</span>
                </span>
                <span className="rh-group">Group view ⌄</span>
                <span className="rh-avatar">A</span>
              </div>
              <div
                className="ht-stage"
                data-phase={phase}
                data-beat={frame.beat}
              >
                <AnimatePresence initial={false} mode="sync">
                  {phase === "control" ? (
                    <motion.div
                      key="control"
                      className="ht-view ht-control"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease }}
                    >
                      <ControlCenter
                        reduced={reduced}
                        chart={frame.beat >= 1}
                        attention={frame.beat === 2}
                      />
                    </motion.div>
                  ) : phase === "value" ? (
                    <motion.div
                      key="value"
                      className="ht-view"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45, ease }}
                    >
                      <ValueView />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="decision"
                      className="ht-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease }}
                    >
                      <DecisionView
                        action={phase === "action"}
                        beat={frame.beat}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="ht-demo-controls">
                <span>ILLUSTRATIVE DEMO</span>
                {!reduced && (
                  <nav aria-label="Product demo scenes">
                    {(mobile
                      ? ["control", "decision"]
                      : ["control", "decision", "value"]
                    ).map((destination) => (
                      <button
                        key={destination}
                        aria-label={`Show ${destination === "control" ? "Control Center" : destination === "decision" ? "Decision" : "Value"} demo`}
                        aria-pressed={
                          phase === destination ||
                          (destination === "decision" && phase === "action")
                        }
                        onClick={() => jump(destination as Phase)}
                      >
                        {destination === "control"
                          ? "Control Center"
                          : destination === "decision"
                            ? "Decision"
                            : "Value"}
                      </button>
                    ))}
                    <button
                      aria-label={
                        paused ? "Play product demo" : "Pause product demo"
                      }
                      onClick={() => setPaused((p) => !p)}
                    >
                      {paused ? "Play" : "Pause"}
                    </button>
                  </nav>
                )}
              </div>
            </div>
          </div>
        </LayoutGroup>
      </MotionConfig>
    </div>
  );
}

const steps = [
  "Evidence",
  "State",
  "Futures",
  "Recommendation",
  "Action",
  "Verification",
];
function DecisionView({ action, beat }: { action: boolean; beat: number }) {
  return (
    <div className="ht-decision">
      <div className="ht-heading">
        <span className="rh-demo-label">SUPPLIER / AP</span>
        <span className="ht-status">
          {action ? "Ready for review" : "Decision 01 of 03"}
        </span>
      </div>
      <motion.div
        className="ht-decision-title"
        layoutId="hero-supplier-signal"
        transition={sharedTransition}
      >
        <span className="ht-decision-icon" aria-hidden="true">
          ▤
        </span>
        <div>
          <span>Supplier variance detected</span>
          <h2>Overcharge detected</h2>
        </div>
      </motion.div>
      <motion.div
        className="ht-decision-body"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22, delay: 0.55, ease }}
      >
        <p className="ht-context">
          Contract and invoice evidence connected across 3 locations.
        </p>
        <div className="ht-facts">
          {[
            { label: "Contract", value: "$6.80/L" },
            { label: "Invoiced", value: "$7.45/L" },
            { label: "Exposure", value: "$2,430" },
          ].map((fact) => (
            <div key={fact.label}>
              <span>{fact.label}</span>
              <motion.strong
                initial={false}
                animate={{
                  opacity:
                    fact.label !== "Exposure" || beat >= 5 || action ? 1 : 0,
                  y: fact.label === "Exposure" && beat < 5 && !action ? 3 : 0,
                }}
                transition={{ duration: 0.16, ease }}
              >
                {fact.value}
              </motion.strong>
            </div>
          ))}
        </div>
        <motion.div
          initial={false}
          animate={{
            opacity: beat >= 6 || action ? 1 : 0,
            y: beat >= 6 || action ? 0 : 4,
          }}
          transition={{ duration: 0.18, ease }}
          className="ht-recommendation"
          data-active={action ? "true" : "false"}
        >
          <span className="ht-panel-label">RECOMMENDATION</span>
          <h3>Prepare dispute package</h3>
          <div className="ht-recommendation-body">
            <AnimatePresence mode="wait" initial={false}>
              {action ? (
                <motion.div
                  key="action"
                  className="ht-action-list"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.24, ease }}
                >
                  {[
                    "Compile evidence",
                    "Generate supplier communication",
                    "Track to resolution",
                  ].map((step, i) => (
                    <motion.span
                      key={step}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.16, delay: i * 0.14, ease }}
                    >
                      {step}
                    </motion.span>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="evidence"
                  className="ht-evidence-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.14 }}
                >
                  <span>
                    Contract agreement <small>Connected</small>
                  </span>
                  <span>
                    Supplier invoices <small>Compared</small>
                  </span>
                  <p>Review the evidence. Your team stays in control.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="ht-action-caption">
            <span>
              {action
                ? "Human approval required"
                : "Your team stays in control"}
            </span>
            <motion.span
              className="ht-take-action"
              initial={false}
              animate={{ opacity: beat >= 7 || action ? 1 : 0 }}
              transition={{ duration: 0.16 }}
            >
              Take action →
            </motion.span>
          </div>
        </motion.div>
        <div className="ht-steps" aria-label="Decision lifecycle">
          {steps.map((step) => (
            <motion.span
              key={step}
              initial={false}
              data-active={
                action
                  ? step === "Action"
                  : beat >= 6
                    ? step === "Recommendation"
                    : step === "Evidence"
              }
            >
              {(action
                ? step === "Action"
                : beat >= 6
                  ? step === "Recommendation"
                  : step === "Evidence") && (
                <motion.i
                  className="ht-tab-indicator"
                  layoutId="hero-decision-tab"
                  transition={{ duration: 0.18, ease }}
                />
              )}
              <span>{step}</span>
            </motion.span>
          ))}
        </div>{" "}
      </motion.div>
    </div>
  );
}
function ValueView() {
  return (
    <div className="ht-value">
      <div className="ht-heading">
        <span className="rh-demo-label">VALUE / SUPPLIER AP</span>
        <span className="ht-status">Awaiting outcome</span>
      </div>
      <h2>
        Track value.
        <br />
        Verify the outcome.
      </h2>
      <p>
        A prepared action is a next step.
        <br />
        Recovery is confirmed only when there’s evidence.
      </p>
      <div className="ht-value-cards">
        <div>
          <span>Expected</span>
          <strong>$2,430</strong>
          <small>Potential recovery</small>
        </div>
        <div>
          <span>Observed</span>
          <strong>Pending</strong>
          <small>Not yet observed</small>
        </div>
        <div>
          <span>Verified</span>
          <strong>$0</strong>
          <small>No recovery verified</small>
        </div>
      </div>
      <div className="ht-value-track">
        <span>Decision</span>
        <i />
        <span>Action</span>
        <i />
        <span>Outcome pending</span>
      </div>
      <div className="ht-value-note">
        Expected value is not recovered value.
      </div>
    </div>
  );
}
