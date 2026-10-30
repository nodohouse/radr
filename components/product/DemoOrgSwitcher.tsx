"use client";

/**
 * DemoOrgSwitcher — NORTHSTAR RESTAURANTS | NORTHSTAR HOTELS.
 * Demo-only. Recomposes the product surface via session + store.
 * Maps persona intentionally across verticals — does not invent roles.
 */

import { writeDemoOrgSession } from "@/lib/radr/demo/demoOrgSession";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import {
  demoOrgForVertical,
  primaryLocationId,
} from "@/lib/radr/demo/organizations";
import { useProduct } from "@/lib/product/store";
import type { RoleView } from "@/lib/product/types";
import type { LocationScope } from "@/lib/product/demo/dashboard";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import {
  mapRoleAcrossVertical,
  roleContextFor,
} from "@/lib/radr/product/personas";
import { controlCenterLensFor } from "@/lib/radr/product/controlCenterLens";

function applyOrgSideEffects(
  vertical: DemoVerticalFamily,
  fromVertical: DemoVerticalFamily,
  currentRole: RoleView,
  setLocationScope: (id: LocationScope) => void,
  setRoleView: (role: RoleView) => void,
  setDefaultLocationId: (id: string) => void,
  setPeriod: (p: "today" | "yesterday" | "wtd" | "mtd" | "ytd") => void,
) {
  const org = demoOrgForVertical(vertical);
  const loc = primaryLocationId(org) as LocationScope;
  const nextRole = mapRoleAcrossVertical(currentRole, fromVertical, vertical);
  const ctx = roleContextFor(nextRole, vertical);
  const lens = controlCenterLensFor(nextRole, vertical);

  setDefaultLocationId(loc);
  setRoleView(nextRole);
  setLocationScope(
    ctx.defaultLocationId === "all" ? "all" : (ctx.defaultLocationId as LocationScope),
  );
  setPeriod(lens.periodDefault);
}

type Props = {
  className?: string;
  /** world = operating bar (no DEMO kicker) · demo = account / env context */
  variant?: "world" | "demo";
};

export function DemoOrgSwitcher({
  className = "",
  variant = "demo",
}: Props) {
  const { session } = useDemoOrg();
  const {
    roleView,
    setLocationScope,
    setRoleView,
    setDefaultLocationId,
    setPeriod,
  } = useProduct();

  function pick(vertical: DemoVerticalFamily) {
    if (session.vertical === vertical) return;
    const from = session.vertical;
    writeDemoOrgSession(vertical);
    applyOrgSideEffects(
      vertical,
      from,
      roleView,
      setLocationScope,
      setRoleView,
      setDefaultLocationId,
      setPeriod,
    );
  }

  return (
    <div
      className={`rp-demo-org-switch ${className}`.trim()}
      data-variant={variant}
      role="radiogroup"
      aria-label={variant === "world" ? "Operating world" : "DEMO environment"}
    >
      {variant === "demo" ? (
        <span className="rp-demo-org-kicker">DEMO</span>
      ) : null}
      <div className="rp-demo-org-segment">
        {(
          [
            ["restaurant", "Restaurants"],
            ["hotel", "Hotels"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={session.vertical === id}
            data-active={session.vertical === id ? "true" : undefined}
            className="rp-demo-org-btn"
            onClick={() => pick(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
