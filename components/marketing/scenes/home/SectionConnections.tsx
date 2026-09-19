"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RadrWordmark } from "@/components/marketing/RadrWordmark";

/** Compact labels - fit the orchestration map without collision. */
const SYSTEMS = [
  "PMS",
  "POS",
  "Procurement",
  "Workforce",
  "Accounting",
  "Payments",
  "Delivery",
  "Revenue",
] as const;

const OUTCOMES = [
  { id: "findings", key: "findings" as const },
  { id: "predictions", key: "predictions" as const },
  { id: "decisions", key: "decisions" as const },
  { id: "actions", key: "actions" as const },
  { id: "verified", key: "verified" as const },
  { id: "playbooks", key: "playbooks" as const },
] as const;

/**
 * Systems stay. RADR sits above as the operating layer.
 * Visual: sources → RADR → outcomes.
 */
export function SectionConnections() {
  const t = useTranslations("homepage.connections");

  return (
    <section
      className="rx-hconn rx-section"
      id="connections"
      data-nav-theme="light"
    >
      <div className="rx-shell rx-hconn-grid">
        <header className="rx-hconn-head">
          <p className="rx-kicker">{t("kicker")}</p>
          <h2 className="rx-display">{t("title")}</h2>
          <p className="rx-lead">{t("lead")}</p>
          <p className="rx-hconn-links">
            <Link href="/product/connections">{t("linkConnections")}</Link>
            <Link href="/security">{t("linkSecurity")}</Link>
          </p>
        </header>

        <div className="rx-hconn-stage" aria-label={t("stackLabel")}>
          <div className="rx-hconn-glow" aria-hidden="true" />

          <div className="rx-hconn-flow">
            <div className="rx-hconn-lane" data-lane="systems">
              <p className="rx-hconn-lane-label">{t("systemsLabel")}</p>
              <ul className="rx-hconn-sources">
                {SYSTEMS.map((s) => (
                  <li key={s}>
                    <i aria-hidden="true" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rx-hconn-bridge" data-dir="in" aria-hidden="true">
              <span className="rx-hconn-beam" />
              <span className="rx-hconn-beam-pulse" />
            </div>

            <div className="rx-hconn-core">
              <span className="rx-hconn-core-ring" data-r="1" aria-hidden="true" />
              <span className="rx-hconn-core-ring" data-r="2" aria-hidden="true" />
              <span className="rx-hconn-core-ring" data-r="3" aria-hidden="true" />
              <div className="rx-hconn-core-mark">
                <RadrWordmark size="md" variant="luminous" surface="dark" />
                <strong>{t("layerLabel")}</strong>
              </div>
            </div>

            <div className="rx-hconn-bridge" data-dir="out" aria-hidden="true">
              <span className="rx-hconn-beam" />
              <span className="rx-hconn-beam-pulse" />
            </div>

            <div className="rx-hconn-lane" data-lane="outcomes">
              <p className="rx-hconn-lane-label">{t("outcomesLabel")}</p>
              <ul className="rx-hconn-outputs">
                {OUTCOMES.map((o) => (
                  <li key={o.id} data-out={o.id}>
                    <strong>{t(`outcomes.${o.key}`)}</strong>
                    <em>{t(`outcomeHints.${o.key}`)}</em>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
