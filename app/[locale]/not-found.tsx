"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { DeltaGlyph } from "@/components/marketing/primitives/DeltaGlyph";

export default function LocaleNotFound() {
  const t = useTranslations("errors");

  return (
    <div className="radr radr-mineral">
      <SiteNav />
      <main className="rx-404" data-nav-theme="light">
        <div className="rx-shell rx-404-inner">
          <p className="rx-kicker">{t("notFoundKicker")}</p>
          <div className="rx-404-glyph" aria-hidden="true">
            <DeltaGlyph size={88} living active />
          </div>
          <h1 className="rx-404-title">{t("notFoundTitle")}</h1>
          <p className="rx-404-lead">{t("notFoundLead")}</p>
          <Link href="/" className="rx-btn rx-btn-primary">
            {t("returnHome")} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
