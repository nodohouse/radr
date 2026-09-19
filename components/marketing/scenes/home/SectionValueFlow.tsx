"use client";

import { useTranslations } from "next-intl";

const STEPS = [
  { id: "detected", timeKey: "t1", detailKey: "d1" },
  { id: "exposure", timeKey: "t2", detailKey: "d2" },
  { id: "actioned", timeKey: "t3", detailKey: "d3" },
  { id: "retained", timeKey: "t4", detailKey: "d4" },
  { id: "closed", timeKey: "t5", detailKey: "d5" },
  { id: "verified", timeKey: "t6", detailKey: "d6" },
] as const;

const CATEGORIES = ["recovered", "protected", "created", "avoided"] as const;

/**
 * Verified Value evidence chain — RADR only takes credit it can prove.
 */
export function SectionValueFlow() {
  const t = useTranslations("homepage.valueFlow");

  return (
    <section className="rx-ed-section rx-ed-valueflow" data-nav-theme="light" id="value-flow">
      <div className="rx-shell">
        <header className="rx-ed-head rx-ed-head-wide">
          <p className="rx-kicker">{t("kicker")}</p>
          <h2 className="rx-display rx-display-lg">{t("title")}</h2>
          <p className="rx-lead">{t("lead")}</p>
        </header>

        <ol className="rx-ed-value-chain" aria-label={t("aria")}>
          {STEPS.map((s, i) => (
            <li key={s.id} data-step={s.id === "verified" ? "verified" : s.id}>
              <span className="rx-ed-value-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="rx-ed-value-label">{t(`steps.${s.id}`)}</span>
              <strong>{t(`times.${s.timeKey}`)}</strong>
              <em>{t(`details.${s.detailKey}`)}</em>
            </li>
          ))}
        </ol>

        <ul className="rx-ed-value-cats" aria-label={t("categoriesAria")}>
          {CATEGORIES.map((id) => (
            <li key={id}>
              <strong>{t(`categories.${id}.label`)}</strong>
              <span>{t(`categories.${id}.detail`)}</span>
            </li>
          ))}
        </ul>

        <p className="rx-ed-restraint">{t("restraint")}</p>
      </div>
    </section>
  );
}
