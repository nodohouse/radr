"use client";

import { useTranslations } from "next-intl";
import { RadrWordmark } from "@/components/marketing/RadrWordmark";

/**
 * Arc layout - fragmented systems fan into RADR.
 */
const SYSTEMS = [
  { id: "pos", label: "POS", x: 4, y: 38 },
  { id: "pms", label: "PMS", x: 14, y: 12 },
  { id: "res", label: "Reservations", x: 28, y: 3 },
  { id: "labor", label: "Labor", x: 44, y: 1 },
  { id: "rms", label: "RMS", x: 60, y: 3 },
  { id: "acc", label: "Accounting", x: 74, y: 12 },
  { id: "ch", label: "Channels", x: 86, y: 38 },
] as const;

const CORE = { x: 50, y: 86 };
const QUESTIONS = ["q1", "q2", "q3", "q4", "q5"] as const;

function curvePath(x: number, y: number) {
  const x1 = x + 7;
  const y1 = y + 5;
  const midY = y1 + (CORE.y - y1) * 0.42;
  return `M ${x1} ${y1} Q ${CORE.x} ${midY} ${CORE.x} ${CORE.y}`;
}

/**
 * Problem: hospitality has a decision problem, not a data problem.
 */
export function SectionProblem() {
  const t = useTranslations("homepage.problem");

  return (
    <section
      className="rx-ed-section rx-ed-problem"
      data-nav-theme="light"
      id="problem"
    >
      <div className="rx-shell rx-ed-problem-grid">
        <header className="rx-ed-head rx-ed-problem-copy">
          <p className="rx-kicker">{t("kicker")}</p>
          <h2 className="rx-display">{t("title")}</h2>
          <p className="rx-lead">{t("lead")}</p>
          <ul className="rx-ed-problem-qs">
            {QUESTIONS.map((q) => (
              <li key={q}>{t(`questions.${q}`)}</li>
            ))}
          </ul>
        </header>

        <div className="rx-ed-converge" aria-label={t("aria")}>
          <div className="rx-ed-converge-field" aria-hidden="true" />
          <div className="rx-ed-converge-vignette" aria-hidden="true" />
          <div className="rx-ed-converge-orbit" aria-hidden="true" />

          <svg
            className="rx-ed-converge-paths"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="rx-ed-path-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(0,217,120,0.15)" />
                <stop offset="55%" stopColor="rgba(0,217,120,0.55)" />
                <stop offset="100%" stopColor="rgba(0,217,120,0.85)" />
              </linearGradient>
              <filter id="rx-ed-path-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="0.6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {SYSTEMS.map((s, i) => {
              const d = curvePath(s.x, s.y);
              return (
                <g key={s.id} className="rx-ed-converge-path-g" style={{ ["--i" as string]: i }}>
                  <path className="rx-ed-converge-path-glow" d={d} />
                  <path className="rx-ed-converge-path" d={d} />
                  <circle className="rx-ed-converge-pulse" r="0.7">
                    <animateMotion dur={`${2.8 + (i % 3) * 0.35}s`} repeatCount="indefinite" path={d} />
                  </circle>
                </g>
              );
            })}
          </svg>

          <ul className="rx-ed-systems">
            {SYSTEMS.map((s, i) => (
              <li
                key={s.id}
                style={{
                  ["--i" as string]: i,
                  ["--x" as string]: `${s.x}%`,
                  ["--y" as string]: `${s.y}%`,
                }}
              >
                <span className="rx-ed-sys-dot" aria-hidden="true" />
                <span className="rx-ed-sys-label">{s.label}</span>
              </li>
            ))}
          </ul>

          <div className="rx-ed-converge-core">
            <span className="rx-ed-converge-ring" aria-hidden="true" />
            <span className="rx-ed-converge-ring" data-r="2" aria-hidden="true" />
            <span className="rx-ed-converge-ring" data-r="3" aria-hidden="true" />
            <span className="rx-ed-converge-glow" aria-hidden="true" />
            <div className="rx-ed-converge-core-inner">
              <RadrWordmark size="md" variant="luminous" surface="dark" />
              <em>{t("coreHint")}</em>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
