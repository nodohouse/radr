"use client";

/**
 * Homepage — cinematic chapters, not identical sections.
 *
 * 1 Recovery → 2 Control Center → 3 Verified € → 4 Decisions →
 * 5 Data Origin → 6 Verified Value → 7 Path → 8 Pilot
 */

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Hero } from "@/components/marketing/scenes/Hero";
import { HomeControlCenterPreview } from "@/components/marketing/scenes/home/HomeControlCenterPreview";
import { RecoveryStoryObject } from "@/components/marketing/scenes/home/RecoveryStoryObject";
import { SystemOfDecisionRecord } from "@/components/marketing/scenes/home/SystemOfDecisionRecord";
import { VerifiedValueTrust } from "@/components/marketing/scenes/home/VerifiedValueTrust";
import { ProgressionLadder } from "@/components/marketing/scenes/home/ProgressionLadder";
import { ConnectionOriginSection } from "@/components/marketing/kinetic/ConnectionOriginSection";
import { PilotTimeline } from "@/components/marketing/kinetic/PilotTimeline";
import type { ProgressionStage } from "@/lib/radr/problemFamilies";
import "@/app/kinetic.css";
import "@/app/radr-public.css";

export function HomepageSpine() {
  const t = useTranslations("homepage.recover");

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

      <section className="rx-rec-sec rx-rec-sec-quiet" data-nav-theme="light">
        <div className="rx-shell">
          <HomeControlCenterPreview />
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

      <section className="rx-rec-sec rx-rec-sec-band" data-nav-theme="light">
        <div className="rx-shell">
          <SystemOfDecisionRecord />
        </div>
      </section>

      <section className="rx-rec-sec rx-rec-sec-ivory" data-nav-theme="light">
        <div className="rx-shell-wide">
          <ConnectionOriginSection />
        </div>
      </section>

      <section className="rx-rec-sec rx-rec-sec-quiet" data-nav-theme="light">
        <div className="rx-shell">
          <VerifiedValueTrust />
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
