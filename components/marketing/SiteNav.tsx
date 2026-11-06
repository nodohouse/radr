"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import { entryFont } from "@/components/onboarding/entryFont";
import "./nav/navigation-glass.css";
import { CTAS } from "@/lib/marketing/brand";
import {
  COMPANY_LINKS,
  PLATFORM_COLUMNS,
  SOLUTIONS_HOSPITALITY,
  VALUE_LEAK_CLASSES,
  VALUE_LEAK_DEEPER,
  VALUE_LEAK_HREF,
} from "./nav/navConfig";
import { CompanyPanel, PlatformPanel, SolutionsPanel } from "./nav/NavPanels";

type MenuId = "platform" | "solutions" | "company";

const OPEN_DELAY_MS = 120;
const CLOSE_DELAY_MS = 180;

type Props = { variant?: "home" | "pricing" };

type PanelPos = { left: number; top: number; width: number };

export function SiteNav({ variant }: Props) {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<MenuId | null>(null);
  const [mobileExpand, setMobileExpand] = useState<MenuId | null>(null);
  const [panelPos, setPanelPos] = useState<PanelPos | null>(null);

  const closeTimer = useRef<number | null>(null);
  const openTimer = useRef<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const keyboardMenu = useRef(false);
  const triggerRefs = useRef<Partial<Record<MenuId, HTMLElement | null>>>({});

  const activeTop = pathname.startsWith("/product")
    ? "platform"
    : pathname.startsWith("/solutions") || pathname.startsWith("/industries")
      ? "solutions"
      : pathname.startsWith("/value-calculator")
        ? "valueCalculator"
        : pathname === "/pricing" || variant === "pricing"
          ? "pricing"
          : pathname.startsWith("/company") ||
              pathname.startsWith("/approach") ||
              pathname.startsWith("/security") ||
              pathname.startsWith("/contact") ||
              pathname.startsWith("/why") ||
              pathname.startsWith("/developers")
            ? "company"
            : null;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearClose = useCallback(() => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const clearOpen = useCallback(() => {
    if (openTimer.current) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
  }, []);

  const closeMenu = useCallback(() => {
    keyboardMenu.current = false;
    clearClose();
    clearOpen();
    setMenu(null);
  }, [clearClose, clearOpen]);

  const scheduleClose = useCallback(() => {
    clearClose();
    clearOpen();
    closeTimer.current = window.setTimeout(() => setMenu(null), CLOSE_DELAY_MS);
  }, [clearClose, clearOpen]);

  const openMenu = useCallback(
    (id: MenuId, immediate = false) => {
      clearClose();
      clearOpen();
      if (immediate || menu === id) {
        setMenu(id);
        return;
      }
      openTimer.current = window.setTimeout(() => setMenu(id), OPEN_DELAY_MS);
    },
    [clearClose, clearOpen, menu],
  );

  const measurePanel = useCallback((id: MenuId) => {
    const trigger = triggerRefs.current[id];
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const navRect = (
      navRef.current?.querySelector(".rx-nav-bar") ?? navRef.current
    )?.getBoundingClientRect();
    const brand = navRef.current
      ?.querySelector(".rx-nav-bar > .rx-nav-brand")
      ?.getBoundingClientRect();
    const actions = navRef.current
      ?.querySelector(".rx-nav-right")
      ?.getBoundingClientRect();
    const safeLeft = Math.max(24, (brand?.right ?? 0) + 24);
    const safeRight = Math.min(
      window.innerWidth - 24,
      (actions?.left ?? window.innerWidth) - 24,
    );
    const widthMap: Record<MenuId, number> = {
      platform: 980,
      solutions: 900,
      company: 500,
    };
    const width = Math.min(widthMap[id], Math.max(0, safeRight - safeLeft));
    const preferredLeft =
      id === "company"
        ? rect.left + rect.width / 2 - width / 2
        : safeLeft + (safeRight - safeLeft - width) / 2;
    const left = Math.max(safeLeft, Math.min(preferredLeft, safeRight - width));
    const top = (navRect?.bottom ?? rect.bottom) + 12;
    setPanelPos({ left, top, width });
  }, []);

  useLayoutEffect(() => {
    if (!menu) {
      setPanelPos(null);
      return;
    }
    measurePanel(menu);
    const onResize = () => measurePanel(menu);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [menu, measurePanel]);

  useEffect(() => {
    if (!menu || !panelPos || !keyboardMenu.current) return;
    const frame = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
      keyboardMenu.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [menu, panelPos]);

  useEffect(() => {
    const resize = () => {
      if (window.innerWidth <= 1120) closeMenu();
      else setDrawerOpen(false);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [closeMenu]);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      setScrolled(window.scrollY > 16);
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    closeMenu();
    setDrawerOpen(false);
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    const restoreFocus = menuButtonRef.current;
    document.body.style.overflow = "hidden";
    const drawer = document.getElementById("rx-drawer");
    const frame = requestAnimationFrame(() =>
      drawer?.querySelector<HTMLButtonElement>("button")?.focus(),
    );
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !drawer) return;
      const items = Array.from(
        drawer.querySelectorAll<HTMLElement>("a[href], button"),
      ).filter((n) => n.getClientRects().length);
      const first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", trap);
      document.body.style.overflow = previous;
      restoreFocus?.focus();
    };
  }, [drawerOpen]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (menu && panelRef.current?.contains(document.activeElement))
          triggerRefs.current[menu]?.focus();
        closeMenu();
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMenu, menu]);

  useEffect(() => {
    if (!menu) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (navRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      closeMenu();
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [menu, closeMenu]);

  const enter = reduced
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const };
  const exit = reduced
    ? { duration: 0 }
    : { duration: 0.14, ease: [0.22, 1, 0.36, 1] as const };

  const isHome = pathname === "/" || pathname === "";

  return (
    <>
      <header
        ref={navRef}
        className="rx-nav"
        data-material="glass"
        data-ready={mounted ? "true" : undefined}
        data-theme="light"
        data-scrolled={scrolled ? "true" : "false"}
        data-menu={menu ? "open" : "closed"}
        data-home={isHome ? "true" : "false"}
        suppressHydrationWarning
      >
        <div className="rx-nav-bar">
          <Link href="/" className="rx-nav-brand" aria-label={t("homeAria")}>
            <FrozenRadrLogo
              variant="mark"
              theme="light"
              width={40}
              priority
              className="rx-nav-lockup rx-nav-lockup--mark"
            />
          </Link>

          <nav
            className="rx-nav-center"
            aria-label={t("primaryNav")}
            onMouseLeave={scheduleClose}
          >
            {(
              [
                ["platform", "product", "/product"],
                ["solutions", "solutions", "/solutions"],
              ] as const
            ).map(([id, key, href]) => (
              <NavTrigger
                key={id}
                id={id}
                href={href}
                label={t(key)}
                active={activeTop === id}
                open={menu === id}
                onOpen={() => openMenu(id)}
                onOpenNow={() => {
                  keyboardMenu.current = true;
                  openMenu(id, true);
                }}
                onStay={clearClose}
                onNavigate={closeMenu}
                setRef={(el) => {
                  triggerRefs.current[id] = el;
                }}
              />
            ))}

            <Link
              href="/value-calculator"
              className="rx-nav-link rx-nav-link--direct rx-nav-link--value"
              data-active={activeTop === "valueCalculator" ? "true" : "false"}
              title="Model what may be worth investigating in your operation."
              onMouseEnter={scheduleClose}
            >
              <span className="rx-nav-value-dot" aria-hidden />
              {t("valueCalculator")}
            </Link>

            <Link
              href="/pricing"
              className="rx-nav-link rx-nav-link--direct"
              data-active={activeTop === "pricing" ? "true" : "false"}
              onMouseEnter={scheduleClose}
            >
              {t("pricing")}
            </Link>

            <NavTrigger
              id="company"
              href="/company"
              label={t("company")}
              active={activeTop === "company"}
              open={menu === "company"}
              onOpen={() => openMenu("company")}
              onOpenNow={() => {
                keyboardMenu.current = true;
                openMenu("company", true);
              }}
              onStay={clearClose}
              onNavigate={closeMenu}
              setRef={(el) => {
                triggerRefs.current.company = el;
              }}
            />
          </nav>

          <div className="rx-nav-right">
            <Link href="/login" className="rx-nav-signin">
              {t("signIn")}
            </Link>
            <Link href={CTAS.seeInActionHref} className="rx-nav-cta">
              Explore demo
            </Link>
            <button
              type="button"
              className="rx-nav-menu"
              ref={menuButtonRef}
              aria-expanded={drawerOpen}
              aria-controls="rx-drawer"
              onClick={() => setDrawerOpen((v) => !v)}
            >
              {drawerOpen ? t("close") : t("menu")}
            </button>
          </div>
        </div>

        {mounted
          ? createPortal(
              <AnimatePresence>
                {menu && panelPos ? (
                  <motion.div
                    key="rx-nav-panel"
                    ref={panelRef}
                    id={menu ? `rx-nav-panel-${menu}` : undefined}
                    className={`rx-nav-panel ${entryFont.variable}`}
                    data-menu={menu}
                    data-material="glass"
                    data-theme="light"
                    role="region"
                    aria-label={`${menu} menu`}
                    style={{
                      left: panelPos.left,
                      top: panelPos.top,
                      width: panelPos.width,
                    }}
                    initial={
                      reduced ? false : { opacity: 0, y: -6, scale: 0.985 }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.985 }}
                    transition={menu ? enter : exit}
                    onMouseEnter={clearClose}
                    onMouseLeave={scheduleClose}
                  >
                    <div className="rx-nav-panel-inner">
                      {menu === "platform" ? (
                        <PlatformPanel onNavigate={closeMenu} theme="light" />
                      ) : null}
                      {menu === "solutions" ? (
                        <SolutionsPanel onNavigate={closeMenu} theme="light" />
                      ) : null}
                      {menu === "company" ? (
                        <CompanyPanel onNavigate={closeMenu} theme="light" />
                      ) : null}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>,
              document.body,
            )
          : null}

        <div
          id="rx-drawer"
          className="rx-nav-drawer"
          role={drawerOpen ? "dialog" : undefined}
          aria-modal={drawerOpen || undefined}
          aria-label={t("primaryNav")}
          hidden={!drawerOpen}
          data-open={drawerOpen ? "true" : "false"}
        >
          <div className="rx-nav-drawer-top">
            <Link
              href="/"
              className="rx-nav-brand"
              aria-label={t("homeAria")}
              onClick={() => setDrawerOpen(false)}
            >
              <FrozenRadrLogo
                variant="mark"
                theme="light"
                width={34}
                className="rx-nav-lockup rx-nav-lockup--mark"
              />
            </Link>
            <button
              type="button"
              className="rx-nav-drawer-close"
              onClick={() => setDrawerOpen(false)}
            >
              {t("close")}
            </button>
          </div>

          <MobileAccordion
            label={t("platform")}
            href="/product"
            open={mobileExpand === "platform"}
            onToggle={() =>
              setMobileExpand((v) => (v === "platform" ? null : "platform"))
            }
            onNavigate={() => setDrawerOpen(false)}
          >
            {PLATFORM_COLUMNS.flatMap((col) =>
              col.items.map((l) => (
                <Link
                  key={`${col.key}-${l.key}`}
                  href={l.href}
                  onClick={() => setDrawerOpen(false)}
                >
                  {t(`panels.platform.columns.${col.key}.items.${l.key}.label`)}
                </Link>
              )),
            )}
          </MobileAccordion>
          <MobileAccordion
            label={t("solutions")}
            href="/solutions"
            open={mobileExpand === "solutions"}
            onToggle={() =>
              setMobileExpand((v) => (v === "solutions" ? null : "solutions"))
            }
            onNavigate={() => setDrawerOpen(false)}
          >
            {SOLUTIONS_HOSPITALITY.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                onClick={() => setDrawerOpen(false)}
              >
                {t(`panels.solutions.hospitality.${l.key}.label`)}
              </Link>
            ))}
            {VALUE_LEAK_CLASSES.map((l) => (
              <Link
                key={l.key}
                href={
                  VALUE_LEAK_HREF[l.key as keyof typeof VALUE_LEAK_HREF] ??
                  l.href
                }
                onClick={() => setDrawerOpen(false)}
              >
                {t(`panels.solutions.classes.${l.key}.label`)}
              </Link>
            ))}
            {VALUE_LEAK_DEEPER.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                onClick={() => setDrawerOpen(false)}
              >
                {t(`panels.solutions.deeper.${l.key}.label`)}
              </Link>
            ))}
          </MobileAccordion>
          <Link href="/value-calculator" onClick={() => setDrawerOpen(false)}>
            {t("valueCalculator")}
          </Link>
          <Link href="/pricing" onClick={() => setDrawerOpen(false)}>
            {t("pricing")}
          </Link>
          <MobileAccordion
            label={t("company")}
            href="/company"
            open={mobileExpand === "company"}
            onToggle={() =>
              setMobileExpand((v) => (v === "company" ? null : "company"))
            }
            onNavigate={() => setDrawerOpen(false)}
          >
            {COMPANY_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setDrawerOpen(false)}
              >
                {t(`panels.company.links.${l.key}.label`)}
              </Link>
            ))}
          </MobileAccordion>
          <Link href="/login" onClick={() => setDrawerOpen(false)}>
            {t("signIn")}
          </Link>
          <Link
            href={CTAS.seeInActionHref}
            className="rx-nav-drawer-cta"
            onClick={() => setDrawerOpen(false)}
          >
            {t("seeInAction")}
          </Link>
        </div>
      </header>
    </>
  );
}

function NavTrigger({
  id,
  href,
  label,
  active,
  open,
  onOpen,
  onOpenNow,
  onStay,
  onNavigate,
  setRef,
}: {
  id: MenuId;
  href: string;
  label: string;
  active: boolean;
  open: boolean;
  onOpen: () => void;
  onOpenNow: () => void;
  onStay: () => void;
  onNavigate: () => void;
  setRef: (el: HTMLElement | null) => void;
}) {
  const router = useRouter();
  const panelId = `rx-nav-panel-${id}`;

  return (
    <div
      className="rx-nav-trigger-wrap"
      onMouseEnter={() => {
        onStay();
        onOpen();
      }}
      onPointerEnter={() => {
        onStay();
        onOpen();
      }}
    >
      <Link
        ref={setRef}
        href={href}
        className="rx-nav-link"
        data-active={active || open ? "true" : "false"}
        aria-expanded={open ? "true" : "false"}
        aria-controls={open ? panelId : undefined}
        aria-haspopup="true"
        id={`${id}-trigger`}
        onFocus={onStay}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === " ") {
            e.preventDefault();
            onOpenNow();
            return;
          }
        }}
        onClick={(e) => {
          e.preventDefault();
          onNavigate();
          router.push(href);
        }}
      >
        {label}
      </Link>
    </div>
  );
}

function MobileAccordion({
  label,
  href,
  open,
  onToggle,
  onNavigate,
  children,
}: {
  label: string;
  href: string;
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rx-nav-acc" data-open={open ? "true" : "false"}>
      <div className="rx-nav-acc-head">
        <Link href={href} className="rx-nav-acc-label" onClick={onNavigate}>
          {label}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`${open ? "Collapse" : "Expand"} ${label}`}
        >
          <span aria-hidden="true">{open ? "−" : "+"}</span>
        </button>
      </div>
      {open ? <div className="rx-nav-acc-body">{children}</div> : null}
    </div>
  );
}
