"use client";

import { useTranslations } from "next-intl";

const LAYERS = [
  {
    id: "known",
    items: ["occupancy", "revenue", "reservations", "labor"] as const,
  },
  {
    id: "hidden",
    items: ["margin", "demand", "relationships", "leakage"] as const,
  },
  {
    id: "predicted",
    items: ["readiness", "stockout", "walkins", "cancellation"] as const,
  },
  {
    id: "decision",
    items: ["action"] as const,
  },
  {
    id: "verified",
    items: ["outcome"] as const,
  },
] as const;

/**
 * KNOWN → HIDDEN → PREDICTED → DECISION → VERIFIED hierarchy.
 */
export function SectionKnownHidden() {
  const t = useTranslations("homepage.knownHidden");

  return (
    <section
      className="rx-ed-section rx-ed-known"
      data-nav-theme="light"
      id="known-hidden"
    >
      <div className="rx-shell">
        <header className="rx-ed-head rx-ed-head-wide">
          <p className="rx-kicker">{t("kicker")}</p>
          <h2 className="rx-display rx-display-lg">{t("title")}</h2>
          <p className="rx-lead">{t("lead")}</p>
        </header>

        <ol className="rx-ed-known-stack" aria-label={t("aria")}>
          {LAYERS.map((layer) => (
            <li key={layer.id} data-layer={layer.id}>
              <div className="rx-ed-known-label">
                <strong>{t(`layers.${layer.id}.label`)}</strong>
                <span>{t(`layers.${layer.id}.sub`)}</span>
              </div>
              <ul>
                {layer.items.map((item) => (
                  <li key={item}>{t(`layers.${layer.id}.items.${item}`)}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
