"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { localeNames, locales, type AppLocale } from "@/i18n/routing";

/**
 * Compact language dropdown for the footer.
 * Preserves the current path when switching locale.
 */
export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const node = rootRef.current;
      if (!node || !(event.target instanceof Node)) return;
      if (!node.contains(event.target)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="rx-lang" ref={rootRef}>
      <button
        type="button"
        className="rx-lang-trigger"
        aria-label={t("languageMenu")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="rx-lang-trigger-label">{localeNames[locale]}</span>
        <span className="rx-lang-chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <ul
          id={listId}
          className="rx-lang-menu"
          role="listbox"
          aria-label={t("languageMenu")}
        >
          {locales.map((code) => {
            const active = code === locale;
            return (
              <li key={code} role="option" aria-selected={active}>
                <Link
                  href={pathname}
                  locale={code}
                  hrefLang={code}
                  className="rx-lang-option"
                  data-active={active ? "true" : "false"}
                  onClick={() => setOpen(false)}
                >
                  {localeNames[code]}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
