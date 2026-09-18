"use client";

import { useTranslations } from "next-intl";

/**
 * RADR remembers what worked here.
 */
export function SectionMemory() {
  const t = useTranslations("homepage.memory");

  return (
    <section
      className="rx-ed-section rx-ed-memory"
      data-nav-theme="light"
      id="memory"
    >
      <div className="rx-shell rx-ed-memory-grid">
        <header className="rx-ed-head">
          <p className="rx-kicker">{t("kicker")}</p>
          <h2 className="rx-display">{t("title")}</h2>
          <p className="rx-lead">{t("lead")}</p>
        </header>
        <blockquote className="rx-ed-memory-quote">
          <p>{t("example")}</p>
          <footer>{t("exampleMeta")}</footer>
        </blockquote>
      </div>
    </section>
  );
}
