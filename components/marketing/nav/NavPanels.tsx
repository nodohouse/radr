"use client";

import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import {
  COMPANY_LINKS,
  PLATFORM_COLUMNS,
  PLATFORM_DEFAULT_PREVIEW,
  VALUE_LEAK_CLASSES,
  VALUE_LEAK_DEEPER,
  VALUE_LEAK_HREF,
  platformHrefForItem,
} from "./navConfig";
import { IntelligenceLivePreview, PlatformLivePreview } from "./NavPreviews";

export function DropGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rx-np-group">
      <p className="rx-np-group-title">{title}</p>
      <div className="rx-np-group-list">{children}</div>
    </div>
  );
}

/** Platform: how RADR works · surfaces · trust. */
export function PlatformPanel({
  onNavigate,
  theme = "light",
}: {
  onNavigate: () => void;
  theme?: "light" | "dark";
}) {
  const t = useTranslations("navigation.panels.platform");
  const reduced = useReducedMotion();
  const [active, setActive] = useState<string>(PLATFORM_DEFAULT_PREVIEW);
  const previewHref = platformHrefForItem(active) ?? "/product";

  return (
    <div className="rx-np rx-np-platform" data-theme={theme}>
      <div className="rx-np-platform-main">
        {PLATFORM_COLUMNS.map((col) => (
          <DropGroup key={col.key} title={t(`columns.${col.key}.title`)}>
            {col.items.map((item) => {
              const isActive = active === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="rx-np-item"
                  data-active={isActive ? "true" : "false"}
                  onMouseEnter={() => setActive(item.key)}
                  onFocus={() => setActive(item.key)}
                  onClick={onNavigate}
                >
                  <span className="rx-np-item-signal" aria-hidden="true" />
                  <strong>
                    {t(`columns.${col.key}.items.${item.key}.label`)}
                  </strong>
                  <span>
                    {t(`columns.${col.key}.items.${item.key}.desc`)}
                  </span>
                </Link>
              );
            })}
          </DropGroup>
        ))}
      </div>

      <aside className="rx-np-platform-preview" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            className="rx-np-preview-swap"
            initial={reduced ? false : { opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 3 }}
            transition={{ duration: reduced ? 0 : 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            <NextLink href={previewHref} onClick={onNavigate}>
              <PlatformLivePreview itemKey={active} />
            </NextLink>
          </motion.div>
        </AnimatePresence>
      </aside>
    </div>
  );
}

/** @deprecated alias */
export function ProductPanel(props: {
  onNavigate: () => void;
  theme?: "light" | "dark";
}) {
  return <PlatformPanel {...props} />;
}

/** Where value leaks — five intelligence classes + demoted lenses. */
export function SolutionsPanel({
  onNavigate,
  theme = "light",
}: {
  onNavigate: () => void;
  theme?: "light" | "dark";
}) {
  const t = useTranslations("navigation.panels.solutions");

  return (
    <div className="rx-np rx-np-solutions" data-theme={theme}>
      <div className="rx-np-solutions-body">
        <div className="rx-np-solutions-cols">
          <DropGroup title={t("columns.classes")}>
            {VALUE_LEAK_CLASSES.map((item) => (
              <Link
                key={item.key}
                href={
                  VALUE_LEAK_HREF[item.key as keyof typeof VALUE_LEAK_HREF] ??
                  item.href
                }
                className="rx-np-item rx-np-item--solo"
                onClick={onNavigate}
              >
                <span className="rx-np-item-signal" aria-hidden="true" />
                <strong>{t(`classes.${item.key}.label`)}</strong>
                <span>{t(`classes.${item.key}.desc`)}</span>
              </Link>
            ))}
          </DropGroup>

          <DropGroup title={t("columns.deeper")}>
            {VALUE_LEAK_DEEPER.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="rx-np-item rx-np-item--solo"
                onClick={onNavigate}
              >
                <span className="rx-np-item-signal" aria-hidden="true" />
                <strong>{t(`deeper.${item.key}.label`)}</strong>
                <span>{t(`deeper.${item.key}.desc`)}</span>
              </Link>
            ))}
          </DropGroup>
        </div>

        <aside className="rx-np-platform-preview rx-np-solutions-preview">
          <NextLink href="/solutions" onClick={onNavigate}>
            <IntelligenceLivePreview />
          </NextLink>
        </aside>
      </div>

      <Link href="/solutions" className="rx-np-footlink" onClick={onNavigate}>
        {t("exploreAll")} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

/** Company: compact editorial list. */
export function CompanyPanel({
  onNavigate,
  theme = "light",
}: {
  onNavigate: () => void;
  theme?: "light" | "dark";
}) {
  const t = useTranslations("navigation.panels.company");

  return (
    <div className="rx-np rx-np-company" data-theme={theme}>
      <ul className="rx-np-company-list">
        {COMPANY_LINKS.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              className="rx-np-item rx-np-item--solo"
              onClick={onNavigate}
            >
              <span className="rx-np-item-signal" aria-hidden="true" />
              <strong>{t(`links.${item.key}.label`)}</strong>
            </Link>
          </li>
        ))}
      </ul>
      <p className="rx-np-company-line">{t("brandLine")}</p>
    </div>
  );
}
