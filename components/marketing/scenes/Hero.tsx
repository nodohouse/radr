"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Suspense } from "react";
import { HeroRecoveryScene } from "@/components/marketing/scenes/home/HeroRecoveryScene";
import { HeroProofRail } from "@/components/marketing/scenes/home/HeroProofRail";
import { NothingOffTheRadr } from "@/components/marketing/scenes/home/NothingOffTheRadr";
import { HospitalityEyebrow } from "@/components/marketing/kinetic/HospitalityContextSwitch";

function HeroInner() {
  const t = useTranslations("homepage.hero");
  const params = useSearchParams();
  const useB = params.get("hero") === "b";
  const title = useB ? t("titleVariantB") : t("title");

  return (
    <section
      className="rx-he rx-he-light rx-he-recover rx-he-margin rx-he-sig"
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
              <Link
                href="/contact?intent=recovery-pilot"
                className="rx-btn rx-btn-primary"
              >
                {t("ctaPrimary")} <span aria-hidden="true">→</span>
              </Link>
              <a href="#verified-recovery" className="rx-btn rx-btn-ghost">
                {t("ctaSecondary")}
              </a>
            </div>
            <HeroProofRail />
          </div>

          <div className="rx-he-recover-product">
            <HeroRecoveryScene />
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
