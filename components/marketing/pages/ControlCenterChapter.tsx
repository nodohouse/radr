"use client";

/**
 * Control Center — Group → Location → Decision.
 * LIVE open Decisions only in Needs You. No sealed D-4102.
 */

import { useState } from "react";
import NextLink from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { GroupControlCenterMock } from "@/components/marketing/scenes/home/GroupControlCenterMock";
import { SilenceField } from "@/components/marketing/kinetic/SilenceField";
import { CTAS } from "@/lib/marketing/brand";
import { capabilityBadge } from "@/lib/marketing/capabilityStatus";
import {
  GROUP_METRICS,
  LIVE_D7021,
  LIVE_D7022,
  LIVE_D7023,
  euro,
  locationLabel,
} from "@/lib/marketing/northstarGroup";
import "@/app/product-chapters.css";
import "@/app/econ.css";
import "@/app/kinetic.css";
import "@/app/radr-public.css";

const ROLES = [
  {
    id: "cfo",
    label: "Group CFO",
    line: `${euro(GROUP_METRICS.valueAtRisk)} at risk · ${euro(GROUP_METRICS.verifiedThisMonth)} verified this month`,
    meta: `${GROUP_METRICS.locationCount} locations · settlement + supplier variance first`,
  },
  {
    id: "coo",
    label: "COO",
    line: `${GROUP_METRICS.needsAttention} locations need intervention · ${GROUP_METRICS.withinExpectations} within expectations`,
    meta: `${locationLabel(LIVE_D7021.locationId)} · ${locationLabel(LIVE_D7022.locationId)} · ${locationLabel(LIVE_D7023.locationId)}`,
  },
  {
    id: "regional",
    label: "Regional Ops",
    line: `Cross-location exceptions · ${GROUP_METRICS.needsAttention} open Decisions`,
    meta: "Same brief · regional priority",
  },
  {
    id: "gm",
    label: "GM",
    line: `${locationLabel(LIVE_D7021.locationId)} · today's Decisions only`,
    meta: "Location lens · not group analytics",
  },
] as const;

export function ControlCenterChapter() {
  const [role, setRole] = useState<(typeof ROLES)[number]["id"]>("cfo");
  const active = ROLES.find((r) => r.id === role) ?? ROLES[0]!;

  return (
    <div className="radr rx-ch rx-ch-light">
      <SiteNav />
      <main className="rx-ch-main">
        <section
          className="rx-cc-silence-hero rx-cc-silence-hero-solid"
          data-nav-theme="dark"
        >
          <div className="rx-cc-silence-field" data-phase="silence">
            <div className="rx-shell rx-cc-silence-final">
              <p className="rx-ch-kicker" style={{ color: "#00d978" }}>
                Control Center · {capabilityBadge("controlCenter")}
              </p>
              <h1 className="rx-ch-title" style={{ color: "#f7faf8" }}>
                {GROUP_METRICS.locationCount} locations.
                <br />
                {GROUP_METRICS.needsAttention} things need you.
              </h1>
              <SilenceField needsYou={GROUP_METRICS.needsAttention} />
              <p
                className="rx-pilot-note"
                style={{
                  color: "rgba(247,250,248,0.78)",
                  marginTop: "0.75rem",
                }}
              >
                Illustrative demo
              </p>
            </div>
          </div>
        </section>

        <section className="rx-ch-body" data-nav-theme="light">
          <div className="rx-shell" style={{ maxWidth: "42rem" }}>
            <p className="rx-ch-kicker">Group → Location → Decision</p>
            <GroupControlCenterMock />

            <p className="rx-ch-kicker" style={{ marginTop: "3rem" }}>
              Role lens · same LIVE brief
            </p>
            <div className="rx-plat-stage-rail" role="tablist">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="tab"
                  data-on={role === r.id ? "true" : "false"}
                  aria-selected={role === r.id}
                  onClick={() => setRole(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <article className="rx-cc-lens rx-cc-lens-solid" key={active.id}>
              <div className="rx-cc-lens-copy">
                <em>{active.label} lens</em>
                <strong>{active.line}</strong>
                <span>{active.meta}</span>
              </div>
            </article>

            <div className="rx-ch-ctas">
              <NextLink
                href="/signup?intent=demo&next=/app/enter"
                className="rx-btn rx-btn-primary"
              >
                See RADR in action <span aria-hidden="true">→</span>
              </NextLink>
              <NextLink href="/contact?intent=recovery-pilot" className="rx-btn rx-btn-ghost">
                {CTAS.primarySales}
              </NextLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
