"use client";

/**
 * Same RADR · different person.
 * Desktop Decision + operational field surface — no second phone chassis.
 * Both surfaces update together on role change.
 */

import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { RoleId } from "@/components/marketing/kinetic/RoleProjection";
import { euro, ECON_D4102 } from "@/lib/marketing/publicDecisionEconomics";
import {
  LIVE_D7021,
  LIVE_D7022,
} from "@/lib/marketing/publicLiveDecisions";

const ROLE_ORDER: RoleId[] = ["cfo", "gm", "foh"];

const ROLE_TAB: Record<RoleId, string> = {
  cfo: "CFO",
  gm: "Ops",
  foh: "GM",
};

const EUR_4102 = euro(ECON_D4102.verified);
const EUR_7021 = euro(LIVE_D7021.economics.exposed);
const EUR_7022 = euro(LIVE_D7022.economics.exposed);

const SCENES: Record<
  RoleId,
  {
    deskK: string;
    idLine: string;
    headline: string;
    lines: string[];
    status: string;
    tone?: "exposure" | "urgent" | "verified" | "neutral";
    field: {
      badge: string;
      title: string;
      body: string;
      meta?: string;
      cta: string;
    };
  }
> = {
  cfo: {
    deskK: "CFO · Finance",
    idLine: `Historical · ${ECON_D4102.displayId} · Supplier / AP`,
    headline: `${EUR_4102} supplier recovery`,
    lines: [
      "Contract €6.80/L · Invoice €7.45/L",
      "Credit matched to original invoice",
      "Verified recovered",
    ],
    status: "Verified · matched to INV-88421",
    tone: "verified",
    field: {
      badge: "Verified",
      title: `${EUR_4102} RECOVERED`,
      body: "Matched to invoice.",
      meta: `${ECON_D4102.displayId} · sealed`,
      cta: "Open Trace",
    },
  },
  gm: {
    deskK: "Ops · Reconciliation",
    idLine: `LIVE · ${LIVE_D7021.displayId} · Berlin`,
    headline: `${EUR_7021} unexplained`,
    lines: [
      LIVE_D7021.line,
      LIVE_D7021.detail,
      "Needs investigation",
    ],
    status: "Needs you · open Decision",
    tone: "urgent",
    field: {
      badge: "Needs you",
      title: `${EUR_7021} UNEXPLAINED`,
      body: "Settlement gap requires review.",
      meta: `${LIVE_D7021.displayId} · LIVE`,
      cta: "Investigate",
    },
  },
  foh: {
    deskK: "GM · Location",
    idLine: `LIVE · ${LIVE_D7022.displayId} · Amsterdam`,
    headline: `${EUR_7022} at risk`,
    lines: [
      LIVE_D7022.line,
      LIVE_D7022.detail,
      "Review ready",
    ],
    status: "Review · open Decision",
    tone: "exposure",
    field: {
      badge: "Review",
      title: `${EUR_7022} AT RISK`,
      body: "Evidence package ready.",
      meta: `${LIVE_D7022.displayId} · LIVE`,
      cta: "Review",
    },
  },
};

export function RoleProjectionStrip() {
  const [role, setRole] = useState<RoleId>("cfo");
  const scene = SCENES[role];
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (index + 1) % ROLE_ORDER.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (index - 1 + ROLE_ORDER.length) % ROLE_ORDER.length;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = ROLE_ORDER.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    const id = ROLE_ORDER[next]!;
    setRole(id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="rx-role-strip rx-role-strip-scene">
      <header>
        <p className="rx-rec-k">Across the operation</p>
        <h2 className="rx-rec-h">Same RADR. Different person.</h2>
      </header>

      <div className="rx-role-tabs" role="tablist" aria-label="Role">
        {ROLE_ORDER.map((id, i) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`${baseId}-tab-${id}`}
            aria-controls={`${baseId}-panel`}
            aria-selected={role === id}
            tabIndex={role === id ? 0 : -1}
            data-on={role === id ? "true" : undefined}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            onClick={() => setRole(id)}
            onKeyDown={(e) => onTabKey(e, i)}
          >
            {ROLE_TAB[id]}
          </button>
        ))}
      </div>

      <div
        className="rx-role-stage"
        data-role={role}
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${role}`}
      >
        <article className="rx-role-desk" data-tone={scene.tone}>
          <p className="rx-role-desk-k">{scene.deskK}</p>
          <p className="rx-role-desk-id">{scene.idLine}</p>
          <h3>{scene.headline}</h3>
          <ul>
            {scene.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p className="rx-role-desk-foot">{scene.status}</p>
        </article>

        <aside className="rx-role-field" aria-label={`${ROLE_TAB[role]} field surface`}>
          <p className="rx-role-field-badge">{scene.field.badge}</p>
          <h3>{scene.field.title}</h3>
          <p>{scene.field.body}</p>
          {scene.field.meta ? (
            <p className="rx-role-field-meta">{scene.field.meta}</p>
          ) : null}
          <span className="rx-role-field-cta">{scene.field.cta}</span>
        </aside>
      </div>
    </div>
  );
}
