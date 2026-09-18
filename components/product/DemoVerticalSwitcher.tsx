"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  DEMO_VERTICAL_EVENT,
  isDemoVertical,
  readDemoVertical,
  writeDemoVertical,
  type DemoVertical,
} from "@/lib/radr/operating/resolveProfile";
import { WHEN_HORIZON_KEY } from "@/components/product/WhenScopeStrip";
import { useProduct } from "@/lib/product/store";
import type { RoleView } from "@/lib/product/types";
import type { LocationScope } from "@/lib/product/demo/dashboard";
import { CANAL_HOUSE_LOCATION_ID } from "@/lib/radr/demo/canalHouseAmsterdam";
import { LISBON_RESIDENCES_LOCATION_ID } from "@/lib/radr/demo/lisbonResidences";
import { DEMO_LOCATION_ID } from "@/lib/radr/demoClock";

function resetHorizonToTonight() {
  try {
    sessionStorage.setItem(WHEN_HORIZON_KEY, "tonight");
    window.dispatchEvent(new Event("radr-when-horizon"));
  } catch {
    /* ignore */
  }
}

function applyVerticalSideEffects(
  next: DemoVertical,
  setLocationScope: (id: LocationScope) => void,
  setRoleView: (role: RoleView) => void,
) {
  resetHorizonToTonight();
  if (next === "boutique_hotel") {
    setRoleView("hotel_gm");
    setLocationScope(CANAL_HOUSE_LOCATION_ID);
  } else if (next === "serviced_apartments") {
    setRoleView("gm");
    setLocationScope(LISBON_RESIDENCES_LOCATION_ID);
  } else {
    setRoleView("gm");
    setLocationScope(DEMO_LOCATION_ID);
  }
}

/**
 * DEMO-only: Restaurant · Boutique hotel · Serviced apartments.
 */
export function DemoVerticalSwitcher({ className = "" }: { className?: string }) {
  const [vertical, setVertical] = useState<DemoVertical>("restaurant");
  const { setLocationScope, setRoleView } = useProduct();

  useEffect(() => {
    setVertical(readDemoVertical());
    function onEvt(e: Event) {
      const detail = (e as CustomEvent<DemoVertical>).detail;
      if (isDemoVertical(detail)) setVertical(detail);
    }
    window.addEventListener(DEMO_VERTICAL_EVENT, onEvt);
    return () => window.removeEventListener(DEMO_VERTICAL_EVENT, onEvt);
  }, []);

  function pick(next: DemoVertical) {
    writeDemoVertical(next);
    setVertical(next);
    applyVerticalSideEffects(next, setLocationScope, setRoleView);
  }

  return (
    <div
      className={`rp-vertical-switch ${className}`.trim()}
      role="radiogroup"
      aria-label="Demo operating model"
    >
      <span className="rp-vertical-switch-kicker">Demo model</span>
      <div className="rp-vertical-switch-row">
        {(
          [
            ["restaurant", "Restaurant"],
            ["boutique_hotel", "Boutique hotel"],
            ["serviced_apartments", "Serviced apts"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={vertical === id}
            data-active={vertical === id ? "true" : "false"}
            className="rp-vertical-switch-btn"
            onClick={() => pick(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function useDemoVertical(): DemoVertical {
  const searchParams = useSearchParams();
  const urlVertical = searchParams.get("vertical");
  const { setLocationScope, setRoleView } = useProduct();
  const appliedUrl = useRef<string | null>(null);

  const [vertical, setVertical] = useState<DemoVertical>(() => {
    if (isDemoVertical(urlVertical)) return urlVertical;
    return readDemoVertical();
  });

  useEffect(() => {
    const fromUrl = isDemoVertical(urlVertical) ? urlVertical : null;
    if (fromUrl) {
      // Apply location/role side-effects only when URL vertical changes —
      // not on every store identity update (that remounts boards and kills UI state).
      if (appliedUrl.current !== fromUrl) {
        appliedUrl.current = fromUrl;
        writeDemoVertical(fromUrl);
        applyVerticalSideEffects(fromUrl, setLocationScope, setRoleView);
      }
      setVertical(fromUrl);
    } else {
      appliedUrl.current = null;
      setVertical(readDemoVertical());
    }

    function onEvt(e: Event) {
      const detail = (e as CustomEvent<DemoVertical>).detail;
      if (isDemoVertical(detail)) setVertical(detail);
    }
    window.addEventListener(DEMO_VERTICAL_EVENT, onEvt);
    return () => window.removeEventListener(DEMO_VERTICAL_EVENT, onEvt);
  }, [urlVertical, setLocationScope, setRoleView]);

  return isDemoVertical(urlVertical) ? urlVertical : vertical;
}
