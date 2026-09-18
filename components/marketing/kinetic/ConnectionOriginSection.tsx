"use client";

/**
 * Operating signal map — catalog-backed, ~14 names visible.
 * Status and methods come from INTEGRATION_PROVIDERS only.
 */

import { useState } from "react";
import NextLink from "next/link";
import { RadrWordmark } from "@/components/radr/RadrWordmark";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";
import {
  CATALOG_COUNT,
  HOME_CONNECTION_GROUPS,
  SIGNAL_MAP_OUTPUTS,
  SIGNAL_MAP_VISIBLE_IDS,
  connectionMethodLabel,
  providerById,
  statusLabel,
} from "@/lib/marketing/homeConnections";
import type { IntegrationProvider } from "@/lib/integrations/registry";

const VISIBLE = new Set<string>(SIGNAL_MAP_VISIBLE_IDS);

const MAP_SLOTS: { id: string; area: string; label?: string }[] = [
  { id: "restaurant", area: "nw" },
  { id: "hotel", area: "ne" },
  { id: "serviced", area: "sw" },
  { id: "finance", area: "se", label: "Finance & payments" },
];

function visibleInGroup(groupId: string): IntegrationProvider[] {
  const g = HOME_CONNECTION_GROUPS.find((x) => x.id === groupId);
  if (!g) return [];
  return g.providerIds
    .filter((id) => VISIBLE.has(id))
    .map((id) => providerById(id))
    .filter((p): p is IntegrationProvider => Boolean(p));
}

export function ConnectionOriginSection() {
  const reduced = usePrefersReducedMotion();
  const [hotId, setHotId] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const hot = hotId ? providerById(hotId) : null;
  const payments = visibleInGroup("payments");
  const custom = visibleInGroup("custom");
  const finance = [...visibleInGroup("finance"), ...payments];

  const providersFor = (id: string) =>
    id === "finance" ? finance : visibleInGroup(id);

  return (
    <div className="rx-sigmap">
      <p className="rx-rec-k">Data origin</p>
      <h2 className="rx-rec-h">Connect what already runs your operation.</h2>
      <p className="rx-rec-p rx-rec-muted">
        RADR turns operational and financial signals from the systems already in
        use into one decision-ready operating state.
      </p>

      <div
        className="rx-sigmap-stage"
        data-hot={hotId ?? undefined}
        data-reduced={reduced ? "true" : undefined}
        aria-label="Operating signal map"
      >
        {MAP_SLOTS.map((slot) => {
          const g = HOME_CONNECTION_GROUPS.find((x) => x.id === slot.id)!;
          const providers = providersFor(slot.id);
          return (
            <Cluster
              key={slot.id}
              area={slot.area}
              label={slot.label ?? g.label}
              providers={providers}
              hotId={hotId}
              onHot={setHotId}
            />
          );
        })}

        <div className="rx-sigmap-core">
          {hot && !reduced ? (
            <span className="rx-sigmap-pulse" aria-hidden="true" />
          ) : null}
          <RadrWordmark surface="light" size="md" compact />
          <p className="rx-sigmap-state">Normalized operating state</p>
          <ul className="rx-sigmap-out">
            {SIGNAL_MAP_OUTPUTS.map((o) => (
              <li key={o} data-tone={o === "Verified Value" ? "verified" : undefined}>
                {o}
              </li>
            ))}
          </ul>
          {hot ? (
            <p className="rx-sigmap-path" role="status">
              {hot.name}
              <span aria-hidden="true"> → </span>
              {connectionMethodLabel(hot)}
              <span aria-hidden="true"> → </span>
              RADR
              <span aria-hidden="true"> → </span>
              Decision
            </p>
          ) : null}
        </div>

        <Cluster
          area="custom"
          label="Custom data"
          providers={custom}
          hotId={hotId}
          onHot={setHotId}
        />
      </div>

      <div className="rx-sigmap-mobile">
        {HOME_CONNECTION_GROUPS.map((g) => {
          const providers = g.providerIds
            .map((id) => providerById(id))
            .filter((p): p is IntegrationProvider => Boolean(p));
          const open = openGroup === g.id;
          return (
            <div key={g.id} className="rx-sigmap-acc">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenGroup(open ? null : g.id)}
              >
                {g.label}
              </button>
              {open ? (
                <ul>
                  {providers.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setHotId(p.id === hotId ? null : p.id)}
                        data-on={hotId === p.id ? "true" : undefined}
                      >
                        <strong>{p.name}</strong>
                        <em>{statusLabel(p)}</em>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>

      {hot ? (
        <div className="rx-sigmap-card" role="status">
          <strong>{hot.name}</strong>
          <em data-status={hot.status}>{statusLabel(hot)}</em>
          <span>{connectionMethodLabel(hot)}</span>
        </div>
      ) : null}

      <NextLink href="/developers#integrations" className="rx-sigmap-more">
        Explore {CATALOG_COUNT} connection paths{" "}
        <span aria-hidden="true">→</span>
      </NextLink>
    </div>
  );
}

function Cluster({
  area,
  label,
  providers,
  hotId,
  onHot,
}: {
  area: string;
  label: string;
  providers: IntegrationProvider[];
  hotId: string | null;
  onHot: (id: string | null) => void;
}) {
  return (
    <div className="rx-sigmap-cluster" data-area={area}>
      <p>{label}</p>
      <ul>
        {providers.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              aria-label={`${p.name}, ${statusLabel(p)}`}
              data-on={hotId === p.id ? "true" : undefined}
              onMouseEnter={() => onHot(p.id)}
              onMouseLeave={() => onHot(null)}
              onFocus={() => onHot(p.id)}
              onBlur={() => onHot(null)}
              onClick={() => onHot(p.id)}
            >
              {p.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
