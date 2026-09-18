"use client";

import { useTranslations } from "next-intl";
import { DecisionStream } from "@/components/marketing/scenes/home/DecisionStream";

/**
 * Scene 2 — Decision Stream.
 * Left: editorial lockup (untouched). Right: complexity → clarity.
 */
export function SectionStack() {
  const t = useTranslations("homepage.stack");

  return (
    <section
      className="rx-scene rx-scene-stack"
      data-mode="system"
      data-nav-theme="light"
      id="stack"
    >
      <div className="rx-shell rx-stack-layout">
        <div className="rx-stack-copy">
          <h2 className="rx-scene-display">{t("title")}</h2>
          <p className="rx-scene-lock">{t("lock")}</p>
          <p className="rx-scene-sub">{t("sub")}</p>
        </div>

        <div className="rx-stack-field">
          <DecisionStream />
        </div>
      </div>
    </section>
  );
}
