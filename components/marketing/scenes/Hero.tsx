"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { Suspense } from "react";
import { MarginResponseCard } from "@/components/marketing/scenes/home/MarginResponseCard";
import { HeroRadrPhone } from "@/components/marketing/scenes/home/HeroRadrPhone";
import { NothingOffTheRadr } from "@/components/marketing/scenes/home/NothingOffTheRadr";

/**
 * LEFT — brand + money + CTAs
 * RIGHT — Decision card + overlapping mobile push story
 *
 * Hero A/B: default A. Internal B via ?hero=b
 * A: Recover the value your operation is losing.
 * B: Find where hospitality loses money. Recover it. Prove it.
 */
function HeroInner() {
  const t = useTranslations("homepage.hero");
  const params = useSearchParams();
  const useB = params.get("hero") === "b";
  const title = useB ? t("titleVariantB") : t("title");

  return (
    <section
      className="rx-he rx-he-light rx-he-recover rx-he-margin"
      id="product"
      data-nav-theme="light"
      data-hero-variant={useB ? "b" : "a"}
      aria-label={t("ariaLabel")}
    >
      <div className="rx-shell">
        <div className="rx-he-recover-frame">
          <div className="rx-he-recover-copy">
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
              <NextLink
                href="/app/lab/control-center?seed=recover"
                className="rx-btn rx-btn-ghost"
              >
                {t("ctaSecondary")}
              </NextLink>
            </div>
          </div>

          <div className="rx-he-recover-product">
            <div className="rx-he-product-stage">
              <MarginResponseCard />
              <HeroRadrPhone />
            </div>
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
  const t = useTranslations("homepage.hero");
  return (
    <section
      className="rx-he rx-he-light rx-he-recover rx-he-margin"
      id="product"
      data-nav-theme="light"
      aria-label={t("ariaLabel")}
    >
      <div className="rx-shell">
        <div className="rx-he-recover-frame">
          <div className="rx-he-recover-copy">
            <NothingOffTheRadr size="display" className="rx-he-h0" />
            <h1 className="rx-he-recover-title">{t("title")}</h1>
            <p className="rx-he-recover-support">{t("support")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
