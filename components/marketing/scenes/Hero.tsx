"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Suspense } from "react";
import { DecisionHeroVisual } from "@/components/marketing/scenes/home/DecisionHeroVisual";
import { HeroProofRail } from "@/components/marketing/scenes/home/HeroProofRail";
import { NothingOffTheRadr } from "@/components/marketing/scenes/home/NothingOffTheRadr";
import { HospitalityEyebrow } from "@/components/marketing/kinetic/HospitalityContextSwitch";
import { CTAS } from "@/lib/marketing/brand";
import { demoSignupHref } from "@/lib/marketing/demoAccess";
import "@/app/decision-hero.css";

function HeroInner() {
  const t = useTranslations("homepage.hero");
  const params = useSearchParams();
  const useB = params.get("hero") === "b";
  const title = useB ? t("titleVariantB") : t("title");

  return (
    <section
      className="rx-he rx-he-light rx-he-recover rx-he-margin rx-he-sig rx-he-decision"
      id="product"
      data-nav-theme="light"
      data-hero-variant={useB ? "b" : "a"}
      aria-label={t("ariaLabel")}
    >
      <div className="rx-shell">
        <div className="rx-he-recover-frame">
          <div className="rx-he-recover-copy">
            <HospitalityEyebrow />
            <NothingOffTheRadr size="display" className="rx-he-h0" />
            <h1 className="rx-he-recover-title">{title}</h1>
            <p className="rx-he-recover-support">{t("support")}</p>
            <div className="rx-he-ctas">
              <Link href={demoSignupHref()} className="rx-btn rx-btn-primary">
                {CTAS.seeInAction} <span aria-hidden="true">→</span>
              </Link>
              <Link href="/product" className="rx-btn rx-btn-ghost">
                {t("ctaSecondary")}
              </Link>
            </div>
            <HeroProofRail />
          </div>

          <div className="rx-he-recover-product">
            <DecisionHeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Hero() {
  return (
    <Suspense fallback={<HeroFallback />}>
      <HeroInner />
    </Suspense>
  );
}

function HeroFallback() {
  return (
    <section
      className="rx-he rx-he-light rx-he-recover rx-he-margin"
      data-nav-theme="light"
      aria-hidden="true"
    >
      <div className="rx-shell">
        <div className="rx-he-recover-frame">
          <div className="rx-he-recover-copy">
            <div className="rx-he-fallback-skel" />
          </div>
        </div>
      </div>
    </section>
  );
}
