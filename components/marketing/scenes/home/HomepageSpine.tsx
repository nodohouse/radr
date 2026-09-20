"use client";

/**
 * Homepage — GTM commercial direction.
 * Pulse (global) → Hero → Leaks → Recovery → Roles → Path → Stack → Pilot → CTA
 */

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Hero } from "@/components/marketing/scenes/Hero";
import { RecoveryStoryObject } from "@/components/marketing/scenes/home/RecoveryStoryObject";
import { ProgressionLadder } from "@/components/marketing/scenes/home/ProgressionLadder";
import { LeakMapPanel } from "@/components/marketing/kinetic/LeakMapPanel";
import { RoleProjectionStrip } from "@/components/marketing/kinetic/RoleProjectionStrip";
import { ConnectionOriginSection } from "@/components/marketing/kinetic/ConnectionOriginSection";
import { PilotTimeline } from "@/components/marketing/kinetic/PilotTimeline";
import type { ProblemFamily, ProgressionStage } from "@/lib/radr/problemFamilies";
import "@/app/kinetic.css";
import "@/app/radr-public.css";

const LEAK_ORDER: ProblemFamily[] = [
  "SUPPLIER_AP",
  "RECONCILIATION",
  "COST_VARIANCE",
  "PROCUREMENT",
  "PERISHABLE_REVENUE",
];

export function HomepageSpine() {
  const t = useTranslations("homepage.recover");

  const leaks = Object.fromEntries(
    LEAK_ORDER.map((id) => [id, t(`families.${id}.leaks`)]),
  ) as Record<ProblemFamily, string>;
  const verifies = Object.fromEntries(
    LEAK_ORDER.map((id) => [id, t(`families.${id}.verifies`)]),
  ) as Record<ProblemFamily, string>;

  const progTitles = {
    RECOVER: t("progression.RECOVER.title"),
    PREVENT: t("progression.PREVENT.title"),
    OPTIMIZE: t("progression.OPTIMIZE.title"),
    AUTOPILOT: t("progression.AUTOPILOT.title"),
  } as Record<ProgressionStage, string>;
  const progBodies = {
    RECOVER: t("progression.RECOVER.body"),
    PREVENT: t("progression.PREVENT.body"),
    OPTIMIZE: t("progression.OPTIMIZE.body"),
    AUTOPILOT: t("progression.AUTOPILOT.body"),
  } as Record<ProgressionStage, string>;

  return (
    <div className="rx-home-spine">
      <Hero />

      <section className="rx-rec-sec rx-rec-sec-interactive" data-nav-theme="light">
        <div className="rx-shell">
          <LeakMapPanel
            kicker={t("families.kicker")}
            title={t("families.title")}
            bodies={leaks}
            metas={verifies}
          />
        </div>
      </section>

      <section
        className="rx-rec-sec rx-rec-sec-cinema"
        data-nav-theme="light"
        id="verified-recovery"
      >
        <div className="rx-shell">
          <RecoveryStoryObject
            kicker="Complete recovery"
            title="RADR doesn't stop at finding it."
            lead=""
          />
        </div>
      </section>

      <section className="rx-rec-sec rx-rec-sec-quiet" data-nav-theme="light">
        <div className="rx-shell">
          <RoleProjectionStrip />
        </div>
      </section>

      <section
        className="rx-rec-sec rx-rec-sec-quiet rx-rec-sec-band"
        data-nav-theme="light"
      >
        <div className="rx-shell">
          <ProgressionLadder
            kicker={t("progression.kicker")}
            title={t("progression.title")}
            lead=""
            titles={progTitles}
            bodies={progBodies}
          />
        </div>
      </section>

      <section className="rx-rec-sec rx-rec-sec-ivory" data-nav-theme="light">
        <div className="rx-shell-wide">
          <ConnectionOriginSection />
        </div>
      </section>

      <section className="rx-rec-sec rx-rec-sec-convert" data-nav-theme="light">
        <div className="rx-shell">
          <PilotTimeline
            kicker={t("pilot.kicker")}
            title={t("pilot.title")}
            lead={t("pilot.lead")}
            scope={t("pilot.scope")}
            cta={t("pilot.cta")}
          />
        </div>
      </section>

      <section className="rx-rec-brand" data-nav-theme="light">
        <div className="rx-shell rx-rec-brand-frame">
          <p className="rx-rec-k">{t("footer.brand")}</p>
          <div>
            <h2 className="rx-rec-h">{t("footer.title")}</h2>
            {t("footer.body") ? (
              <p className="rx-rec-p">{t("footer.body")}</p>
            ) : null}
            <div className="rx-he-ctas">
              <Link
                href="/contact?intent=recovery-pilot"
                className="rx-btn rx-btn-primary"
              >
                {t("footer.cta")} <span aria-hidden="true">→</span>
              </Link>
              <a href="#verified-recovery" className="rx-btn rx-btn-ghost">
                {t("footer.secondary")}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
