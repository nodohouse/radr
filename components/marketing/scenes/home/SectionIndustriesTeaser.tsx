"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const ITEMS = [
  { id: "restaurants", href: "/industries#intelligence-restaurants" },
  { id: "hotels", href: "/industries#intelligence-hotels" },
  { id: "apartments", href: "/industries" },
] as const;

/**
 * Scene 7a — QUIET: three verticals, one line each.
 */
export function SectionIndustriesTeaser() {
  const t = useTranslations("homepage.industriesTeaser");

  return (
    <section
      className="rx-scene rx-scene-industries"
      data-mode="quiet"
      data-nav-theme="light"
      id="industries"
    >
      <div className="rx-shell">
        <h2 className="rx-scene-display">{t("title")}</h2>
        <ul className="rx-ind-minimal">
          {ITEMS.map(({ id, href }) => (
            <li key={id}>
              <Link href={href}>
                <strong>{t(`items.${id}.title`)}</strong>
                <span>{t(`items.${id}.line`)}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="rx-scene-trust">
          <strong>{t("trustTitle")}</strong>
          <span>{t("trustLine")}</span>
          <Link href="/security">{t("trustCta")}</Link>
        </p>
      </div>
    </section>
  );
}
