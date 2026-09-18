"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  formatHeroMoney,
  HERO_TIMEFRAME_ORDER,
  HERO_VERTICAL_ORDER,
  HERO_VERTICAL_SCENARIOS,
  type HeroCritical,
  type HeroTimeframeId,
  type HeroVerticalId,
} from "@/components/marketing/data/homepageVerticalDemos";

type StoryPhase =
  | "boot"
  | "copy"
  | "product"
  | "now"
  | "stake"
  | "plan"
  | "why"
  | "action"
  | "alt"
  | "live"
  | "after"
  | "done";

/** Context → insight → economics → recommend → proof → approve. */
const STORY: { phase: StoryPhase; at: number; frame?: HeroTimeframeId }[] = [
  { phase: "copy", at: 0, frame: "pre" },
  { phase: "product", at: 40, frame: "pre" },
  { phase: "now", at: 400, frame: "pre" },
  { phase: "stake", at: 900, frame: "pre" },
  { phase: "plan", at: 1400, frame: "pre" },
  { phase: "why", at: 2000, frame: "pre" },
  { phase: "action", at: 2500, frame: "pre" },
  { phase: "alt", at: 8000, frame: "pre" },
  { phase: "live", at: 15500, frame: "live" },
  { phase: "after", at: 21500, frame: "after" },
  { phase: "done", at: 26500, frame: "after" },
];

const RESTART_AFTER_MS = 32000;
const AUTO_VERTICAL_MS = 36000;
const ALT_REVEAL: { phase: StoryPhase; at: number }[] = [
  { phase: "now", at: 0 },
  { phase: "stake", at: 450 },
  { phase: "plan", at: 900 },
  { phase: "why", at: 1400 },
  { phase: "action", at: 1900 },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function atLeast(current: StoryPhase, target: StoryPhase): boolean {
  const order: StoryPhase[] = [
    "boot",
    "copy",
    "product",
    "now",
    "stake",
    "plan",
    "why",
    "action",
    "alt",
    "live",
    "after",
    "done",
  ];
  return order.indexOf(current) >= order.indexOf(target);
}

function DecisionCard({
  critical,
  currency,
  phase,
  reduced,
  whyOpen,
  onToggleWhy,
  t,
}: {
  critical: HeroCritical;
  currency: "USD" | "EUR";
  phase: StoryPhase;
  reduced: boolean;
  whyOpen: boolean;
  onToggleWhy: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const insightOn = atLeast(phase, "now") || reduced;
  const stakeOn = atLeast(phase, "stake") || reduced;
  const planOn = atLeast(phase, "plan") || reduced;
  const proofOn = atLeast(phase, "why") || reduced;
  const actionOn = atLeast(phase, "action") || reduced;
  const protectOn = planOn;

  const insightLines = critical.insight.split("\n");

  return (
    <article
      className="rx-hpd-decision"
      data-on="true"
      data-beat={
        actionOn ? "action" : proofOn ? "why" : planOn ? "plan" : stakeOn ? "stake" : "now"
      }
    >
      <div className="rx-hpd-decision-media" aria-hidden="true">
        <Image
          src={critical.image}
          alt={critical.imageAlt}
          width={480}
          height={640}
          className="rx-hpd-decision-img"
          priority
        />
      </div>

      <div className="rx-hpd-decision-body">
        <p className="rx-hpd-decision-domain">{critical.domain}</p>

        <div
          className="rx-hpd-decision-insight"
          data-on={insightOn ? "true" : "false"}
        >
          <h4 className="rx-hpd-decision-situation">
            {insightLines.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </h4>
          {critical.shortfall ? (
            <p className="rx-hpd-decision-shortfall">{critical.shortfall}</p>
          ) : null}
        </div>

        <div
          className="rx-hpd-decision-econ"
          data-on={stakeOn ? "true" : "false"}
        >
          <div className="rx-hpd-decision-stake">
            <strong>
              {formatHeroMoney(critical.stakeValue, currency)}
            </strong>
            <span>{critical.stakeLabel}</span>
          </div>
          <div
            className="rx-hpd-decision-protected"
            data-on={protectOn ? "true" : "false"}
          >
            <strong>{critical.protectedAmount}</strong>
            <span>{critical.protectedLabel}</span>
          </div>
        </div>

        <div
          className="rx-hpd-decision-rec"
          data-on={planOn ? "true" : "false"}
        >
          <p className="rx-hpd-decision-rec-label">{t("recommendsLabel")}</p>
          <p className="rx-hpd-decision-primary">
            {critical.recommends.primary}
          </p>
          {critical.recommends.fallback ? (
            <p className="rx-hpd-decision-fallback">
              {critical.recommends.fallback}
            </p>
          ) : null}
        </div>

        <div
          className="rx-hpd-decision-proof"
          data-on={proofOn ? "true" : "false"}
        >
          <p className="rx-hpd-decision-proof-label">{t("evidenceLabel")}</p>
          <ul className="rx-hpd-decision-evidence">
            {critical.proof.slice(0, 3).map((item) => (
              <li key={item.label}>
                <strong>{item.value}</strong>
                <em>{item.label}</em>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="rx-hpd-decision-cta"
          data-on={actionOn ? "true" : "false"}
        >
          <span className="rx-hpd-decision-approve">{critical.cta}</span>
          <div className="rx-hpd-decision-sec-actions">
            <button
              type="button"
              className="rx-hpd-decision-ghost"
              aria-expanded={whyOpen}
              onClick={onToggleWhy}
            >
              {t("why")}
            </button>
            <button type="button" className="rx-hpd-decision-ghost">
              {t("simulate")}
            </button>
          </div>
        </div>

        {whyOpen ? (
          <div className="rx-hpd-decision-basis" data-on="true">
            <p className="rx-hpd-decision-basis-label">{t("whyBasisLabel")}</p>
            <ul>
              {critical.whyBasis.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Shift-brief Control Center — one decision at a time.
 * Progressive disclosure: insight → economics → recommend → proof → approve.
 */
export function HeroProductDemo({
  playToken = 0,
  vertical,
  onReplay,
  onVerticalChange,
  autoRotate = true,
}: {
  playToken?: number;
  vertical: HeroVerticalId;
  onReplay?: () => void;
  onVerticalChange?: (id: HeroVerticalId) => void;
  autoRotate?: boolean;
}) {
  const t = useTranslations("homepage.hero.demo");
  const scenario = HERO_VERTICAL_SCENARIOS[vertical];
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const manualFrameRef = useRef(false);

  const [inView, setInView] = useState(true);
  const [phase, setPhase] = useState<StoryPhase>(reduced ? "done" : "product");
  const [timeframe, setTimeframe] = useState<HeroTimeframeId>("pre");
  const [frameLocked, setFrameLocked] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);
  const [frameFade, setFrameFade] = useState(true);
  const [useAlt, setUseAlt] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [decisionKey, setDecisionKey] = useState(0);
  const prevFrameRef = useRef<HeroTimeframeId>("pre");

  const frame = scenario.frames[timeframe];
  const activeCritical: HeroCritical | undefined =
    useAlt && frame.altCritical ? frame.altCritical : frame.critical;

  const showPulse =
    Boolean(frame.pulse) &&
    !activeCritical &&
    (atLeast(phase, "product") || reduced || frameLocked);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const scheduleDecisionReveal = useCallback(
    (fromAlt = false) => {
      const steps = fromAlt
        ? ALT_REVEAL
        : [
            { phase: "now" as StoryPhase, at: 0 },
            { phase: "stake" as StoryPhase, at: 500 },
            { phase: "plan" as StoryPhase, at: 1000 },
            { phase: "why" as StoryPhase, at: 1600 },
            { phase: "action" as StoryPhase, at: 2100 },
          ];
      for (const sub of steps) {
        const subId = window.setTimeout(() => {
          if (manualFrameRef.current && !fromAlt) return;
          setPhase(sub.phase);
        }, sub.at);
        timersRef.current.push(subId);
      }
    },
    [],
  );

  const runStory = useCallback(() => {
    clearTimers();
    manualFrameRef.current = false;
    setFrameLocked(false);
    setFrameFade(true);
    setUseAlt(false);
    setWhyOpen(false);
    setDecisionKey((k) => k + 1);
    if (reduced) {
      setPhase("done");
      setTimeframe("pre");
      return;
    }
    setPhase("product");
    setTimeframe("pre");
    prevFrameRef.current = "pre";
    for (const step of STORY) {
      const id = window.setTimeout(() => {
        if (manualFrameRef.current) return;

        if (step.phase === "alt") {
          const hasAlt = Boolean(
            HERO_VERTICAL_SCENARIOS[vertical].frames.pre?.altCritical,
          );
          if (!hasAlt || prevFrameRef.current !== "pre") return;
          setFrameFade(false);
          const fadeId = window.setTimeout(() => {
            if (manualFrameRef.current) return;
            setUseAlt(true);
            setWhyOpen(false);
            setDecisionKey((k) => k + 1);
            setPhase("now");
            setFrameFade(true);
            scheduleDecisionReveal(true);
          }, 320);
          timersRef.current.push(fadeId);
          return;
        }

        if (step.frame && step.frame !== prevFrameRef.current) {
          setFrameFade(false);
          const nextFrame = step.frame;
          const fadeId = window.setTimeout(() => {
            if (manualFrameRef.current) return;
            prevFrameRef.current = nextFrame;
            setTimeframe(nextFrame);
            setUseAlt(false);
            setWhyOpen(false);
            setDecisionKey((k) => k + 1);
            const nextScenario = HERO_VERTICAL_SCENARIOS[vertical];
            const nextHasDecision = Boolean(
              nextScenario.frames[nextFrame]?.critical,
            );
            if (nextHasDecision && nextFrame !== "pre") {
              setPhase("now");
              scheduleDecisionReveal(false);
            } else {
              setPhase(step.phase);
            }
            setFrameFade(true);
          }, 380);
          timersRef.current.push(fadeId);
          return;
        }
        setPhase(step.phase);
        if (step.frame) {
          prevFrameRef.current = step.frame;
          setTimeframe(step.frame);
        }
      }, step.at);
      timersRef.current.push(id);
    }
    const restart = window.setTimeout(() => {
      if (document.visibilityState === "visible" && !manualFrameRef.current) {
        setFrameFade(false);
        const fadeId = window.setTimeout(() => {
          if (!manualFrameRef.current) runStory();
        }, 480);
        timersRef.current.push(fadeId);
      }
    }, RESTART_AFTER_MS);
    timersRef.current.push(restart);
  }, [clearTimers, reduced, vertical, scheduleDecisionReveal]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold: 0, rootMargin: "0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    setTransitionKey((k) => k + 1);
    manualFrameRef.current = false;
    setFrameLocked(false);
    setTimeframe("pre");
    setUseAlt(false);
    setWhyOpen(false);
  }, [vertical]);

  useEffect(() => {
    if (!inView) {
      clearTimers();
      return;
    }
    runStory();
    return clearTimers;
  }, [inView, playToken, vertical, runStory, clearTimers]);

  useEffect(() => {
    if (reduced) {
      setPhase("done");
      setTimeframe("pre");
    }
  }, [reduced]);

  useEffect(() => {
    if (!autoRotate || !inView || reduced || !onVerticalChange) return;
    const id = window.setTimeout(() => {
      if (manualFrameRef.current) return;
      const i = HERO_VERTICAL_ORDER.indexOf(vertical);
      const next =
        HERO_VERTICAL_ORDER[(i + 1) % HERO_VERTICAL_ORDER.length]!;
      onVerticalChange(next);
    }, AUTO_VERTICAL_MS);
    return () => clearTimeout(id);
  }, [autoRotate, inView, reduced, vertical, onVerticalChange, playToken]);

  const selectTimeframe = (id: HeroTimeframeId) => {
    clearTimers();
    manualFrameRef.current = true;
    setFrameLocked(true);
    setUseAlt(false);
    setWhyOpen(false);
    setFrameFade(false);
    window.setTimeout(() => {
      prevFrameRef.current = id;
      setTimeframe(id);
      setDecisionKey((k) => k + 1);
      const nextHasDecision = Boolean(
        HERO_VERTICAL_SCENARIOS[vertical].frames[id]?.critical,
      );
      setFrameFade(true);
      if (nextHasDecision && !reduced) {
        setPhase("now");
        scheduleDecisionReveal(false);
      } else {
        setPhase("done");
      }
    }, 320);
  };

  const productReady = atLeast(phase, "product") || reduced || frameLocked;
  const silenceOn = frame.mood === "silence" && productReady;
  const hasCritical =
    Boolean(activeCritical) &&
    (atLeast(phase, "product") || reduced || frameLocked);
  const reviewOn =
    frame.mood === "review" &&
    productReady &&
    Boolean(frame.reviewLines?.length) &&
    !hasCritical;
  const improveOn =
    productReady &&
    Boolean(frame.improveLines?.length) &&
    (frame.mood === "review" || timeframe === "day") &&
    !hasCritical;
  const verifiedOn =
    frame.mood === "review" && productReady && !hasCritical;

  const handlingVisible = frame.handling.slice(0, 2);
  const contextLine = frame.contextLine;

  return (
    <div
      ref={rootRef}
      className="rx-hpd"
      data-phase={phase}
      data-vertical={vertical}
      data-frame={timeframe}
      data-mood={frame.mood}
      data-reduced={reduced ? "true" : "false"}
      aria-label={t("aria")}
    >
      <div
        className="rx-hpd-stage"
        data-ready={productReady ? "true" : "false"}
        key={transitionKey}
      >
        <div className="rx-hpd-plate" aria-hidden="true" />

        <div
          className="rx-hpd-window"
          data-critical={hasCritical ? "true" : "false"}
        >
          {frame.heroImage && !activeCritical ? (
            <div className="rx-hpd-ambient" aria-hidden="true">
              <Image
                src={frame.heroImage}
                alt=""
                fill
                sizes="420px"
                className="rx-hpd-ambient-img"
                priority
              />
            </div>
          ) : null}

          <div className="rx-hpd-chrome">
            <span className="rx-hpd-chrome-left">{scenario.place}</span>
          </div>

          <div
            className="rx-hpd-when"
            role="tablist"
            aria-label={t("whenAria")}
          >
            {HERO_TIMEFRAME_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                className="rx-hpd-when-tab"
                aria-selected={timeframe === id}
                data-on={timeframe === id ? "true" : "false"}
                onClick={() => selectTimeframe(id)}
              >
                {t(`when.${id}`)}
              </button>
            ))}
          </div>

          <div
            className="rx-hpd-body"
            data-fade={frameFade ? "in" : "out"}
            data-frame={timeframe}
            data-critical={hasCritical ? "true" : "false"}
          >
            <header
              className="rx-hpd-hero"
              data-on={productReady ? "true" : "false"}
              data-decision={hasCritical ? "true" : "false"}
            >
              <p className="rx-hpd-kicker">{frame.kicker}</p>
              {hasCritical ? (
                <p className="rx-hpd-context">
                  {contextLine ?? frame.meta}
                </p>
              ) : (
                <>
                  <h3 className="rx-hpd-headline">{frame.headline}</h3>
                  <p className="rx-hpd-meta">{frame.meta}</p>
                </>
              )}
            </header>

            {frame.pulse && showPulse ? (
              <section
                className="rx-hpd-pulse"
                data-on="true"
                data-compact="false"
                aria-label={t("pulseAria")}
              >
                <div className="rx-hpd-pulse-money">
                  <strong>
                    {formatHeroMoney(frame.pulse.amount, scenario.currency)}
                  </strong>
                  <em>{frame.pulse.amountLabel}</em>
                </div>
                <p className="rx-hpd-pulse-forecast">
                  <strong>{frame.pulse.forecastPct}%</strong>{" "}
                  <span>{frame.pulse.forecastLabel}</span>
                </p>
                <div
                  className="rx-hpd-pulse-bar"
                  aria-hidden="true"
                  style={
                    {
                      "--pulse-pct": `${Math.min(100, frame.pulse.forecastPct)}%`,
                    } as CSSProperties
                  }
                >
                  <i
                    style={{
                      width: `${Math.min(100, frame.pulse.forecastPct)}%`,
                    }}
                  />
                  <span className="rx-hpd-pulse-bar-tip">
                    {frame.pulse.forecastPct}%
                  </span>
                  <span className="rx-hpd-pulse-bar-end">Forecast</span>
                </div>
                <ul className="rx-hpd-pulse-chips">
                  {frame.pulse.chips.map((chip) => (
                    <li key={chip.label} data-tone={chip.tone ?? "mute"}>
                      <em>{chip.label}</em>
                      <strong>{chip.value}</strong>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {silenceOn ? (
              <div className="rx-hpd-silence" data-on="true">
                <p className="rx-hpd-silence-note">{frame.silenceNote}</p>
                {handlingVisible.length > 0 ? (
                  <section className="rx-hpd-handling" data-show="true">
                    <p className="rx-hpd-sec-label">
                      {t("bandHandling")} · {frame.handlingCount}
                    </p>
                    <ul>
                      {handlingVisible.map((h) => (
                        <li key={h.label}>
                          <strong>{h.status}</strong>
                          <span>{h.label}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
            ) : null}

            {hasCritical &&
            timeframe === "day" &&
            frame.reviewLines?.length ? (
              <ul className="rx-hpd-review" data-on="true" data-aside="true">
                <li className="rx-hpd-review-label">{t("learnWorked")}</li>
                {frame.reviewLines.slice(0, 2).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}

            {activeCritical && hasCritical ? (
              <DecisionCard
                key={decisionKey}
                critical={activeCritical}
                currency={scenario.currency}
                phase={phase}
                reduced={reduced}
                whyOpen={whyOpen}
                onToggleWhy={() => setWhyOpen((v) => !v)}
                t={t}
              />
            ) : null}

            {!hasCritical &&
            frame.handling.length > 0 &&
            productReady &&
            frame.mood !== "silence" &&
            frame.mood !== "review" ? (
              <section className="rx-hpd-handling" data-show="true" data-quiet="true">
                <p className="rx-hpd-sec-label">
                  {t("bandHandling")} · {frame.handlingCount}
                </p>
                <ul>
                  {handlingVisible.map((h) => (
                    <li key={h.label}>
                      <strong>{h.status}</strong>
                      <span>{h.label}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {reviewOn ? (
              <ul className="rx-hpd-review" data-on="true">
                <li className="rx-hpd-review-label">{t("learnWorked")}</li>
                {frame.reviewLines!.slice(0, 2).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}

            {improveOn ? (
              <ul className="rx-hpd-improve" data-on="true">
                <li className="rx-hpd-improve-label">{t("learnImprove")}</li>
                {frame.improveLines!.slice(0, 2).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}

            {verifiedOn ? (
              <div className="rx-hpd-verified" data-show="true">
                <p className="rx-hpd-sec-label">{t("recentVerified")}</p>
                <p className="rx-hpd-verified-body">
                  <strong>
                    {formatHeroMoney(frame.verified.amount, scenario.currency)}{" "}
                    {t("recovered")}
                  </strong>
                  <span>{frame.verified.label}</span>
                  <em>{t("viewProof")}</em>
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className="rx-hpd-replay"
          data-show={
            atLeast(phase, "done") || reduced || frameLocked ? "true" : "false"
          }
          onClick={() => onReplay?.()}
        >
          <span aria-hidden="true">↻</span>
          {t("replay")}
        </button>
      </div>

      <p className="rx-hpd-disclosure">
        <span
          className="rx-hpd-disclosure-text"
          title={t("disclosureLong")}
          tabIndex={0}
          role="note"
          aria-label={t("disclosureLong")}
        >
          {t("disclosureShort")}
        </span>
      </p>
    </div>
  );
}
