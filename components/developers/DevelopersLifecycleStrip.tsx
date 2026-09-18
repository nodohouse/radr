"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useInView } from "@/components/marketing/motion/useInView";

const STEP_IDS = [
  "event",
  "state",
  "finding",
  "decision",
  "outcome",
  "memory",
] as const;
type StepId = (typeof STEP_IDS)[number];

export function DevelopersLifecycleStrip() {
  const t = useTranslations("developers");
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.4 });
  const [active, setActive] = useState<StepId>("event");
  const hintId = useId();

  const steps = STEP_IDS.map((id) => ({
    id,
    label: t(`hub.lifecycleStrip.steps.${id}.label`),
    hint: t(`hub.lifecycleStrip.steps.${id}.hint`),
  }));

  useEffect(() => {
    if (!inView || reduced) return;
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % STEP_IDS.length;
      setActive(STEP_IDS[i]!);
    }, 3800);
    return () => window.clearInterval(id);
  }, [inView, reduced]);

  const onSelect = useCallback((id: StepId) => setActive(id), []);
  const activeIndex = STEP_IDS.indexOf(active);

  return (
    <section
      ref={ref}
      className="rx-dev-lifecycle"
      aria-label={t("hub.lifecycleStrip.aria")}
      data-active={active}
      data-on={inView ? "true" : "false"}
    >
      <div className="rx-dev-lifecycle-inner">
        <ol className="rx-dev-lifecycle-rail">
          {steps.map((step, index) => {
            const isActive = step.id === active;
            const isPast = index < activeIndex;
            return (
              <li key={step.id} className="rx-dev-lifecycle-item">
                {index > 0 ? (
                  <span
                    className="rx-dev-lifecycle-connector"
                    data-lit={isPast || isActive ? "true" : "false"}
                    aria-hidden
                  />
                ) : null}
                <button
                  type="button"
                  className="rx-dev-lifecycle-node"
                  data-active={isActive ? "true" : "false"}
                  aria-pressed={isActive}
                  aria-describedby={isActive ? hintId : undefined}
                  onClick={() => onSelect(step.id)}
                >
                  <motion.span
                    className="rx-dev-lifecycle-pulse"
                    aria-hidden
                    initial={false}
                    animate={
                      isActive && !reduced
                        ? { scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }
                        : { scale: 1, opacity: 0 }
                    }
                    transition={{
                      duration: 1.6,
                      repeat: isActive ? Infinity : 0,
                      ease: "easeOut",
                    }}
                  />
                  <span className="rx-dev-lifecycle-label">{step.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <p id={hintId} className="rx-dev-lifecycle-hint" role="status">
          {steps.find((s) => s.id === active)?.hint}
        </p>
      </div>
    </section>
  );
}
