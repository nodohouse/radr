"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { Hero } from "@/components/marketing/scenes/Hero";
import { RecoveryStoryObject } from "@/components/marketing/scenes/home/RecoveryStoryObject";
import { ProgressionLadder } from "@/components/marketing/scenes/home/ProgressionLadder";
import { EconomicRail } from "@/components/marketing/kinetic/EconomicRail";
import { StickyStory } from "@/components/marketing/kinetic/StickyStory";
import { KineticInterstitial } from "@/components/marketing/kinetic/KineticInterstitial";
import { LeakClassVisual } from "@/components/marketing/kinetic/LeakClassVisual";
import { PatternCapabilityStrip } from "@/components/marketing/kinetic/PatternCapabilityStrip";
import { ConnectionBand } from "@/components/marketing/kinetic/ConnectionBand";
import { PilotTimeline } from "@/components/marketing/kinetic/PilotTimeline";
import { HOME_RAIL } from "@/lib/marketing/economicRail";
import type { ProblemFamily, ProgressionStage } from "@/lib/radr/problemFamilies";
import "@/app/kinetic.css";

const LEAK_ORDER: ProblemFamily[] = [
  "SUPPLIER_AP",
  "RECONCILIATION",
  "COST_VARIANCE",
  "PROCUREMENT",
  "PERISHABLE_REVENUE",
];

/**
 * Homepage — kinetic recovery story.
 * Hero → data rail → sticky leaks → recovery → patterns → progression →
 * stack → pilot → platform → FAQ → close.
 */
export function HomepageSpine() {
  const t = useTranslations("homepage.recover");

  const labels = Object.fromEntries(
    LEAK_ORDER.map((id) => [id, t(`families.${id}.label`)]),
  ) as Record<ProblemFamily, string>;
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

  const leakChapters = LEAK_ORDER.map((id) => ({
    id,
    kicker: labels[id],
    title: labels[id],
    body: leaks[id],
    meta: verifies[id],
  }));

  return (
    <div className="rx-home-spine">
      <Hero />

      <section className="rx-rec-rail-sec" data-nav-theme="light" aria-label="Economic signals">
        <EconomicRail items={HOME_RAIL} durationSec={52} />
      </section>

      <section className="rx-rec-sec rx-rec-sec-band" data-nav-theme="light">
        <div className="rx-shell">
          <StickyStory
            kicker={t("families.kicker")}
            title={t("families.title")}
            lead={t("families.lead")}
            chapters={leakChapters}
            vhPerChapter={70}
            renderVisual={(i) => (
              <LeakClassVisual family={LEAK_ORDER[i]!} />
            )}
          />
        </div>
      </section>

      <KineticInterstitial from="Credit issued" to="Not applied" tone="exposure" />

      <section className="rx-rec-sec" data-nav-theme="light">
        <div className="rx-shell">
          <RecoveryStoryObject
            kicker={t("story.kicker")}
            title={t("story.title")}
            lead={t("story.lead")}
          />
        </div>
      </section>

      <KineticInterstitial
        from="Expected €9,814"
        to="Actual €9,521"
        tone="exposure"
      />

      <section className="rx-rec-sec rx-rec-sec-band" data-nav-theme="light">
        <div className="rx-shell">
          <PatternCapabilityStrip
            kicker={t("thinks.kicker")}
            title={t("thinks.title")}
            lead={t("thinks.lead")}
            flow={t("thinks.flow")}
            diff={t("thinks.diff")}
            close={t("thinks.close")}
          />
        </div>
      </section>

      <KineticInterstitial from="Food cost +2.3pts" to="Why?" tone="urgent" />

      <section className="rx-rec-sec" data-nav-theme="light">
        <div className="rx-shell">
          <ProgressionLadder
            kicker={t("progression.kicker")}
            title={t("progression.title")}
            lead={t("progression.lead")}
            titles={progTitles}
            bodies={progBodies}
          />
        </div>
      </section>

      <KineticInterstitial from="Room cancelled" to="19h left" tone="urgent" />

      <section className="rx-rec-sec rx-rec-sec-band" data-nav-theme="light">
        <div className="rx-shell">
          <ConnectionBand
            kicker={t("stack.kicker")}
            title={t("stack.title")}
            lead={t("stack.lead")}
            body={t("stack.body")}
            note={t("stack.statesNote")}
          />
        </div>
      </section>

      <section className="rx-rec-sec" data-nav-theme="light">
        <div className="rx-shell">
          <PilotTimeline
            kicker={t("pilot.kicker")}
            title={t("pilot.title")}
            lead={t("pilot.lead")}
            scope={t("pilot.scope")}
            opts={[t("pilot.opt1"), t("pilot.opt2"), t("pilot.opt3")]}
            cta={t("pilot.cta")}
          />
        </div>
      </section>

      <section className="rx-rec-sec rx-rec-sec-band" data-nav-theme="light">
        <div className="rx-shell">
          <div className="rx-rec-block">
            <p className="rx-rec-k">{t("expansion.kicker")}</p>
            <h2 className="rx-rec-h">{t("expansion.title")}</h2>
            <p className="rx-rec-p">{t("expansion.lead")}</p>
            <p className="rx-rec-p">{t("expansion.body")}</p>
            <Link href="/product" className="rx-btn rx-btn-ghost">
              {t("expansion.cta")} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="rx-rec-sec rx-rec-faq-quiet" data-nav-theme="light" id="faq">
        <div className="rx-shell">
          <div className="rx-rec-block">
            <p className="rx-rec-k">{t("faq.kicker")}</p>
            <h2 className="rx-rec-h">{t("faq.title")}</h2>
            <dl className="rx-rec-faq">
              <div>
                <dt>{t("faq.q1")}</dt>
                <dd>{t("faq.a1")}</dd>
              </div>
              <div>
                <dt>{t("faq.q2")}</dt>
                <dd>{t("faq.a2")}</dd>
              </div>
              <div>
                <dt>{t("faq.q3")}</dt>
                <dd>{t("faq.a3")}</dd>
              </div>
              <div>
                <dt>{t("faq.q4")}</dt>
                <dd>{t("faq.a4")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="rx-rec-brand" data-nav-theme="light">
        <div className="rx-shell rx-rec-brand-frame">
          <p className="rx-rec-k">{t("footer.brand")}</p>
          <div>
            <h2 className="rx-rec-h">{t("footer.title")}</h2>
            <p className="rx-rec-p">{t("footer.body")}</p>
            <div className="rx-he-ctas">
              <Link
                href="/contact?intent=recovery-pilot"
                className="rx-btn rx-btn-primary"
              >
                {t("footer.cta")} <span aria-hidden="true">→</span>
              </Link>
              <NextLink
                href="/app/lab/control-center?seed=recover"
                className="rx-btn rx-btn-ghost"
              >
                {t("footer.secondary")}
              </NextLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
