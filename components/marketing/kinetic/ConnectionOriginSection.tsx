"use client";

/**
 * Data origin — static, crystal-clear, fast.
 * Sources → RADR → Decision outputs. No motion loops.
 */

import { useState } from "react";
import NextLink from "next/link";
import { ProviderWordmark } from "@/components/marketing/kinetic/ProviderWordmark";
import {
  CATALOG_COUNT,
  HOME_CONNECTION_GROUPS,
  SIGNAL_MAP_VISIBLE_IDS,
  connectionMethodLabel,
  providerById,
  statusLabel,
} from "@/lib/marketing/homeConnections";
import type { IntegrationProvider } from "@/lib/integrations/registry";

const VISIBLE = new Set<string>(SIGNAL_MAP_VISIBLE_IDS);

const CUSTOM_EVIDENCE = ["Invoices", "Contracts", "CSV"] as const;

const OUTPUTS = [
  { id: "Decision" },
  { id: "Futures" },
  { id: "Action" },
  { id: "Verified Value" },
  { id: "Memory" },
] as const;

const DOMAIN_SLOTS: { id: string; label: string }[] = [
  { id: "restaurant", label: "Restaurant" },
  { id: "hotel", label: "Hotel" },
  { id: "finance", label: "Finance" },
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
  const [hotId, setHotId] = useState<string | null>(null);
  const hot = hotId ? providerById(hotId) : null;

  const payments = visibleInGroup("payments");
  const custom = visibleInGroup("custom");
  const finance = [...visibleInGroup("finance"), ...payments];

  function providersFor(id: string) {
    return id === "finance" ? finance : visibleInGroup(id);
  }

  return (
    <div className="rx-intake">
      <header className="rx-intake-head">
        <p className="rx-rec-k">Data origin</p>
        <h2 className="rx-intake-h">
          The systems are there.
          <span>The economic truth is still fragmented.</span>
        </h2>
        <p className="rx-intake-lead">
          RADR brings financial and operational evidence from the systems already
          in use into one decision-ready operating state — so value leaks can be
          found, acted on and verified.
        </p>
      </header>

      <div className="rx-intake-stage rx-intake-static" aria-label="Signal intake">
        <div className="rx-intake-sources">
          {DOMAIN_SLOTS.map((slot) => {
            return (
              <SourceCluster
                key={slot.id}
                label={slot.label}
                providers={providersFor(slot.id)}
                hotId={hotId}
                onHot={setHotId}
              />
            );
          })}
          <div className="rx-intake-cluster">
            <p>Custom</p>
            <ul className="rx-intake-evidence">
              {CUSTOM_EVIDENCE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {custom[0] ? (
              <ul className="rx-intake-chips">
                <li>
                  <ProviderChip
                    provider={custom[0]}
                    hotId={hotId}
                    onHot={setHotId}
                  />
                </li>
              </ul>
            ) : null}
          </div>
        </div>

        <div className="rx-intake-flow rx-intake-flow-in" aria-hidden="true">
          <i />
        </div>

        <div className="rx-intake-core">
          <div className="rx-intake-core-card">
            <span className="rx-intake-delta" aria-hidden="true">
              <svg viewBox="0 0 100 90" width="52" height="44">
                <path
                  d="M50 8 L90 81 H10 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="11"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="rx-intake-core-name">RADR</p>
            <p className="rx-intake-core-k">Economic decision layer</p>
          </div>
        </div>

        <div className="rx-intake-flow rx-intake-flow-out" aria-hidden="true">
          <i />
        </div>

        <div className="rx-intake-out" aria-label="RADR outputs">
          {OUTPUTS.map((o) => (
            <div
              key={o.id}
              className="rx-intake-primitive"
              data-tone={o.id === "Verified Value" ? "verified" : undefined}
            >
              <strong>{o.id}</strong>
            </div>
          ))}
        </div>
      </div>

      {hot ? (
        <div className="rx-intake-status" role="status">
          <ProviderWordmark id={hot.id} name={hot.name} />
          <div>
            <strong>{hot.name}</strong>
            <em data-status={hot.status}>{statusLabel(hot)}</em>
          </div>
          <span>{connectionMethodLabel(hot)}</span>
          <p>
            {hot.name}
            <span aria-hidden="true"> → </span>
            RADR
            <span aria-hidden="true"> → </span>
            Decision
          </p>
        </div>
      ) : null}

      <NextLink href="/developers#integrations" className="rx-intake-more">
        Explore {CATALOG_COUNT} connection paths{" "}
        <span aria-hidden="true">→</span>
      </NextLink>
    </div>
  );
}

function SourceCluster({
  label,
  providers,
  hotId,
  onHot,
}: {
  label: string;
  providers: IntegrationProvider[];
  hotId: string | null;
  onHot: (id: string | null) => void;
}) {
  return (
    <div className="rx-intake-cluster">
      <p>{label}</p>
      <ul className="rx-intake-chips">
        {providers.map((p) => (
          <li key={p.id}>
            <ProviderChip provider={p} hotId={hotId} onHot={onHot} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProviderChip({
  provider,
  hotId,
  onHot,
}: {
  provider: IntegrationProvider;
  hotId: string | null;
  onHot: (id: string | null) => void;
}) {
  return (
    <button
      type="button"
      className="rx-intake-chip"
      aria-label={`${provider.name}, ${statusLabel(provider)}`}
      data-on={hotId === provider.id ? "true" : undefined}
      data-status={provider.status}
      data-provider-brand={provider.id.split("-")[0]}
      onMouseEnter={() => onHot(provider.id)}
      onMouseLeave={() => onHot(null)}
      onFocus={() => onHot(provider.id)}
      onBlur={() => onHot(null)}
      onClick={() => onHot(provider.id)}
    >
      <ProviderWordmark id={provider.id} name={provider.name} />
    </button>
  );
}
