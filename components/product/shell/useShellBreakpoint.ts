"use client";

import { useEffect, useState } from "react";

/** Desktop left operating rail. */
export const SHELL_DESKTOP_MIN = 1100;
/** Phone bottom tabs. */
export const SHELL_MOBILE_MAX = 959;

/**
 * Shell nav mode — mount exactly one primary navigation system.
 * desktop: left operating rail (collapsed / hover-expand / pin)
 * drawer: icon rail + hamburger expand (tablet)
 * mobile: bottom tabs (+ sheet rail for utilities)
 */
export type ShellNavMode = "desktop" | "drawer" | "mobile";

export function useShellNavMode(): ShellNavMode {
  const [mode, setMode] = useState<ShellNavMode>("desktop");

  useEffect(() => {
    const desktopMq = window.matchMedia(`(min-width: ${SHELL_DESKTOP_MIN}px)`);
    const mobileMq = window.matchMedia(`(max-width: ${SHELL_MOBILE_MAX}px)`);
    const sync = () => {
      if (desktopMq.matches) setMode("desktop");
      else if (mobileMq.matches) setMode("mobile");
      else setMode("drawer");
    };
    sync();
    desktopMq.addEventListener("change", sync);
    mobileMq.addEventListener("change", sync);
    return () => {
      desktopMq.removeEventListener("change", sync);
      mobileMq.removeEventListener("change", sync);
    };
  }, []);

  return mode;
}
