"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useDemoOrg } from "./useDemoOrg";
import { useProduct } from "@/lib/product/store";
import { getRadrEnvironment } from "@/lib/radr/env";
import {
  DEMO_INVITATION_KEY,
  demoInvitationEligible,
  emptyDemoInvitation,
  readDemoInvitation,
} from "@/lib/marketing/demoInvitation";
import "@/app/demo-conversion.css";

/** Optional next step after exploration. Never redirects, steals focus or blocks the demo. */
export function DemoPlanInvitation() {
  const { isHotel } = useDemoOrg();
  const { contextReady } = useProduct();
  const path = usePathname();
  const enabled = getRadrEnvironment() === "DEMO" && contextReady;
  const progress = useRef(emptyDemoInvitation());
  const loaded = useRef(false);
  const pointerDown = useRef(false);
  const lastInteraction = useRef(0);
  const openRef = useRef(false);
  const [open, setOpen] = useState(false);

  const save = useCallback(() => {
    try {
      sessionStorage.setItem(
        DEMO_INVITATION_KEY,
        JSON.stringify(progress.current),
      );
    } catch {
      /* Optional frequency-capping storage. */
    }
  }, []);
  const dismiss = useCallback(() => {
    progress.current.dismissed = true;
    openRef.current = false;
    setOpen(false);
    save();
  }, [save]);
  useEffect(() => {
    if (!enabled) return;
    if (!loaded.current) {
      try {
        progress.current = readDemoInvitation(
          sessionStorage.getItem(DEMO_INVITATION_KEY),
        );
      } catch {
        /* Keep an in-memory cap when storage is unavailable. */
      }
      loaded.current = true;
    }
    const area = path === "/app" ? "control-center" : path.split("/")[2];
    if (
      area &&
      /^[a-z-]{1,32}$/.test(area) &&
      !progress.current.areas.includes(area)
    )
      progress.current.areas.push(area);
    lastInteraction.current = Date.now();
    if (openRef.current) {
      openRef.current = false;
      setOpen(false);
    }
    save();
  }, [enabled, path, save]);

  useEffect(() => {
    if (!enabled) return;
    let previous = Date.now();
    let ticks = 0;
    function interact(event: Event) {
      if (
        event.target instanceof Element &&
        event.target.closest(".rp-demo-invitation")
      )
        return;
      progress.current.interacted = true;
      lastInteraction.current = Date.now();
      if (openRef.current) {
        openRef.current = false;
        setOpen(false);
        save();
      }
    }
    function down(event: PointerEvent) {
      if (
        event.target instanceof Element &&
        event.target.closest(".rp-demo-invitation")
      )
        return;
      pointerDown.current = true;
      interact(event);
    }
    function up() {
      pointerDown.current = false;
    }
    function key(event: KeyboardEvent) {
      if (event.key === "Escape" && openRef.current) dismiss();
      else interact(event);
    }
    function visibility() {
      previous = Date.now();
      if (document.visibilityState !== "visible") save();
    }
    const timer = window.setInterval(() => {
      const now = Date.now();
      const delta = Math.max(0, Math.min(now - previous, 2000));
      previous = now;
      if (document.visibilityState !== "visible" || !document.hasFocus())
        return;
      if (
        progress.current.interacted &&
        !progress.current.shown &&
        !progress.current.dismissed
      )
        progress.current.activeMs += delta;
      const active = document.activeElement;
      const editing =
        active instanceof Element &&
        Boolean(
          active.closest(
            'input, textarea, select, [contenteditable="true"], [role="textbox"]',
          ),
        );
      const blocked =
        editing ||
        pointerDown.current ||
        Boolean(
          document.querySelector(
            'dialog[open], [role="dialog"], [aria-modal="true"], .rp-frame-v2[data-nav="open"]',
          ),
        );
      // If a guest opens a task or starts typing, give the workspace back immediately.
      if (openRef.current && blocked) {
        openRef.current = false;
        setOpen(false);
        save();
      }
      if (
        demoInvitationEligible(
          progress.current,
          now - lastInteraction.current,
          blocked,
        )
      ) {
        progress.current.shown = true;
        openRef.current = true;
        setOpen(true);
        save();
      } else if (++ticks % 10 === 0) save();
    }, 1000);
    document.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("pointerup", up, { passive: true });
    document.addEventListener("pointercancel", up, { passive: true });
    document.addEventListener("keydown", key);
    document.addEventListener("scroll", interact, {
      passive: true,
      capture: true,
    });
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", save);
    return () => {
      window.clearInterval(timer);
      save();
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", up);
      document.removeEventListener("keydown", key);
      document.removeEventListener("scroll", interact, true);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", save);
    };
  }, [enabled, dismiss, save]);

  if (!enabled || !open) return null;
  return (
    <aside
      className="rp-demo-invitation"
      aria-label="Optional next step"
      aria-live="polite"
    >
      <button
        className="rp-demo-invitation-close"
        type="button"
        onClick={dismiss}
        aria-label="Dismiss plan invitation"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m5 5 10 10M5 15 15 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <span className="rp-demo-invitation-kicker">WHEN YOU’RE READY</span>
      <h2>See RADR in your operation?</h2>
      <p>
        Keep exploring, or compare the options whenever it suits you. Your demo
        stays open.
      </p>
      <div className="rp-demo-invitation-actions">
        <button type="button" onClick={dismiss}>
          Keep exploring
        </button>
        <Link
          href={`/pricing?from=demo&vertical=${isHotel ? "hotel" : "restaurant"}#plans`}
          onClick={dismiss}
        >
          Explore plans <span aria-hidden="true">→</span>
        </Link>
      </div>
    </aside>
  );
}
