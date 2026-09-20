"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useInView } from "@/components/marketing/motion/useInView";

type TierKey = "core" | "control";

const STEPS: {
  key: TierKey;
  label: string;
  tokens: readonly string[];
  /** Token indices newly added at this tier (0-based within tokens). */
  freshFrom: number;
}[] = [
  {
    key: "core",
    label: "Core",
    tokens: ["SEE", "DECIDE", "VERIFY"],
    freshFrom: 0,
  },
  {
    key: "control",
    label: "Control",
    tokens: ["SEE", "DECIDE", "PREPARE", "VERIFY", "GOVERN"],
    freshFrom: 2,
  },
];

const SPRING = { type: "spring" as const, stiffness: 420, damping: 32 };

const RESP_TOKENS = new Set(["SEE", "DECIDE", "VERIFY"]);

type Props = {
  kicker: string;
};

export function PricingLifecycleRail({ kicker }: Props) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.35 });
  const [active, setActive] = useState<TierKey>("core");

  useEffect(() => {
    if (!inView || reduced) return;
    const order: TierKey[] = ["core", "control"];
    let i = 0;
    setActive(order[0]!);
    const id = window.setInterval(() => {
      i = (i + 1) % order.length;
      setActive(order[i]!);
    }, 4200);
    return () => window.clearInterval(id);
  }, [inView, reduced]);

  const onPick = useCallback((key: TierKey) => {
    setActive(key);
  }, []);

  const activeIndex = STEPS.findIndex((s) => s.key === active);

  return (
    <section
      ref={ref}
      className="px-lifecycle"
      data-nav-theme="light"
      data-active-tier={active}
      aria-label="Decision responsibility by package"
    >
      <div className="rx-shell">
        <p className="rx-kicker">{kicker}</p>
        <ol className="px-lifecycle-rail">
          {STEPS.map((step, stepIndex) => {
            const isActive = step.key === active;
            const isPast = stepIndex < activeIndex;
            return (
              <li key={step.key} className="px-lifecycle-step-wrap">
                {stepIndex > 0 ? (
                  <span
                    className="px-lifecycle-arrow"
                    aria-hidden="true"
                    data-lit={isPast || isActive ? "true" : "false"}
                  >
                    →
                  </span>
                ) : null}
                <motion.button
                  type="button"
                  className="px-lifecycle-step"
                  data-tier={step.key}
                  data-active={isActive ? "true" : "false"}
                  data-past={isPast ? "true" : "false"}
                  onClick={() => onPick(step.key)}
                  aria-pressed={isActive}
                  animate={
                    reduced
                      ? undefined
                      : {
                          scale: isActive ? 1 : 0.98,
                          opacity: isActive ? 1 : isPast ? 0.88 : 0.72,
                        }
                  }
                  transition={SPRING}
                >
                  <em>{step.label}</em>
                  <span className="px-lifecycle-tokens">
                    {step.tokens.map((token, ti) => {
                      const isFresh = ti >= step.freshFrom;
                      return (
                        <span
                          key={token}
                          className="px-lifecycle-token"
                          data-fresh={isFresh && isActive ? "true" : "false"}
                          data-carried={!isFresh ? "true" : "false"}
                          data-resp={
                            RESP_TOKENS.has(token)
                              ? token.toLowerCase()
                              : undefined
                          }
                        >
                          {token}
                          {ti < step.tokens.length - 1 ? (
                            <span className="px-lifecycle-dot" aria-hidden>
                              ·
                            </span>
                          ) : null}
                        </span>
                      );
                    })}
                  </span>
                  <span className="px-lifecycle-sr">
                    {step.label}: {step.tokens.join(", ")}
                  </span>
                </motion.button>
              </li>
            );
          })}
        </ol>
        <div className="px-lifecycle-track" aria-hidden="true">
          <motion.span
            className="px-lifecycle-track-fill"
            initial={false}
            animate={{
              scaleX: reduced ? 1 : (activeIndex + 1) / STEPS.length,
            }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          />
        </div>
      </div>
    </section>
  );
}
