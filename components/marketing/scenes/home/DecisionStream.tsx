"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CTA } from "@/components/marketing/config/cta";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";

type Vertical = "restaurant" | "hotel" | "bar" | "apartment";
type Phase = "noise" | "compress" | "decide" | "hold";

const VERTICALS: Vertical[] = ["hotel", "restaurant", "bar", "apartment"];

const SIGNAL_KEYS: Record<Vertical, readonly string[]> = {
  hotel: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "h7",
    "h8",
    "h9",
    "h10",
    "h11",
    "h12",
  ],
  restaurant: [
    "r1",
    "r2",
    "r3",
    "r4",
    "r5",
    "r6",
    "r7",
    "r8",
    "r9",
    "r10",
    "r11",
    "r12",
  ],
  bar: ["b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "b10"],
  apartment: [
    "a1",
    "a2",
    "a3",
    "a4",
    "a5",
    "a6",
    "a7",
    "a8",
    "a9",
    "a10",
  ],
};

const PHASE_MS = {
  noise: 3200,
  compress: 2800,
  decide: 6200,
  hold: 1000,
} as const;

const CASCADE = [
  { at: 0, count: 57, labelKey: "read" as const },
  { at: 900, count: 6, labelKey: "attention" as const },
  { at: 1800, count: 2, labelKey: "needYou" as const },
];

function useCountUp(target: number, active: boolean, reduced: boolean) {
  const [value, setValue] = useState(target);
  useEffect(() => {
    if (reduced || !active) {
      setValue(target);
      return;
    }
    let frame = 0;
    const frames = 16;
    const from = Math.max(target + 14, Math.round(target * 1.4));
    let raf = 0;
    const tick = () => {
      frame += 1;
      const p = Math.min(1, frame / frames);
      const eased = 1 - (1 - p) ** 3;
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setValue(from);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, reduced]);
  return value;
}

/**
 * One stage. Noise → compression → decision you want to buy.
 * No mid-stream logo. No collage of systems diagrams.
 */
export function DecisionStream() {
  const t = useTranslations("homepage.stack");
  const tn = useTranslations("navigation");
  const reduced = useReducedMotionSafe();
  const rootRef = useRef<HTMLDivElement>(null);
  const [vertical, setVertical] = useState<Vertical>("hotel");
  const [phase, setPhase] = useState<Phase>(reduced ? "decide" : "noise");
  const [cascadeIdx, setCascadeIdx] = useState(reduced ? 2 : 0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reduced) {
      setPhase("decide");
      setCascadeIdx(2);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    setPhase("noise");
    setCascadeIdx(0);

    let elapsed = 0;
    later(() => {
      if (!cancelled) {
        setPhase("compress");
        setCascadeIdx(0);
      }
    }, (elapsed += PHASE_MS.noise));

    CASCADE.slice(1).forEach((step) => {
      later(() => {
        if (!cancelled) setCascadeIdx(CASCADE.indexOf(step));
      }, elapsed + step.at);
    });

    later(() => {
      if (!cancelled) setPhase("decide");
    }, (elapsed += PHASE_MS.compress));

    later(() => {
      if (!cancelled) setPhase("hold");
    }, (elapsed += PHASE_MS.decide));

    later(() => {
      if (cancelled) return;
      setVertical((v) => {
        const i = VERTICALS.indexOf(v);
        return VERTICALS[(i + 1) % VERTICALS.length];
      });
      setCycle((c) => c + 1);
    }, (elapsed += PHASE_MS.hold));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [reduced, cycle]);

  const signals = SIGNAL_KEYS[vertical];
  const step = CASCADE[cascadeIdx];
  const shownCount = useCountUp(step.count, phase === "compress", reduced);
  const deciding = phase === "decide" || phase === "hold";
  const compressing = phase === "compress";

  return (
    <div
      ref={rootRef}
      className="rx-stream"
      data-phase={phase}
      data-vertical={vertical}
      aria-label={t("aria")}
    >
      <div className="rx-stream-modes" aria-label={t("modesAria")}>
        {VERTICALS.map((v) => (
          <span key={v} data-on={v === vertical ? "1" : "0"}>
            {t(`verticals.${v}`)}
          </span>
        ))}
      </div>

      <div className="rx-stream-stage">
        {/* Layer A — operating noise */}
        <div
          className="rx-stream-noise"
          data-active={phase === "noise" || compressing ? "1" : "0"}
          data-compress={compressing ? "1" : "0"}
          aria-hidden={deciding}
        >
          <p className="rx-stream-noise-k">{t("noiseKicker")}</p>
          <div className="rx-stream-noise-field">
            {signals.map((key, i) => (
              <span
                key={`${vertical}-${key}-${cycle}`}
                className="rx-stream-sig"
                data-keep={i < 2 ? "1" : "0"}
                style={{ ["--i" as string]: i }}
              >
                {t(`signals.${vertical}.${key}`)}
              </span>
            ))}
          </div>
        </div>

        {/* Layer B — compression (the wow beat) */}
        <div
          className="rx-stream-compress"
          data-active={compressing ? "1" : "0"}
          aria-live="polite"
          aria-hidden={!compressing}
        >
          <p className="rx-stream-compress-line">{t("mantra")}</p>
          <div className="rx-stream-compress-num" data-step={cascadeIdx}>
            <strong>{shownCount}</strong>
            <span>{t(`compress.${step.labelKey}`)}</span>
          </div>
          <ol className="rx-stream-compress-trail" aria-hidden="true">
            {CASCADE.map((row, i) => (
              <li
                key={row.labelKey}
                data-state={
                  cascadeIdx === i ? "now" : cascadeIdx > i ? "done" : "wait"
                }
              >
                {row.count}
              </li>
            ))}
          </ol>
        </div>

        {/* Layer C — the decision you want to buy */}
        <article
          className="rx-stream-decision"
          data-active={deciding ? "1" : "0"}
          aria-hidden={!deciding}
        >
          <p className="rx-stream-decision-ask">{t("decision.ask")}</p>
          <p className="rx-stream-decision-domain">
            {t(`verticals.${vertical}`)}
            <span aria-hidden="true"> · </span>
            {t(`decision.${vertical}.domain`)}
          </p>
          <h3 className="rx-stream-decision-title">
            {t(`decision.${vertical}.title`)}
          </h3>
          <p className="rx-stream-decision-lede">
            {t(`decision.${vertical}.lede`)}
          </p>
          <p className="rx-stream-decision-value">
            <strong>{t(`decision.${vertical}.value`)}</strong>
            <span>{t(`decision.${vertical}.valueLabel`)}</span>
          </p>
          <p className="rx-stream-decision-rec">
            <em>{t("decision.recommends")}</em>
            {t(`decision.${vertical}.rec`)}
          </p>
          <div className="rx-stream-decision-cta">
            <Link href={CTA.bookDemo.href} className="rx-stream-cta-primary">
              {tn("bookDemo")}
            </Link>
            <Link href={CTA.seeInAction.href} className="rx-stream-cta-ghost">
              {tn("seeInAction")}
            </Link>
          </div>
          <p className="rx-stream-decision-quiet">{t("decision.quiet")}</p>
        </article>
      </div>
    </div>
  );
}
