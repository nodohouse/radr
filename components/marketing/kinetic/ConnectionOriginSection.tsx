"use client";

/**
 * Signal intake — Sources → RADR → Decision outputs.
 * One RADR. One system list. Catalog for the rest.
 */

import { useEffect, useId, useState } from "react";
import NextLink from "next/link";
import { ProviderWordmark } from "@/components/marketing/kinetic/ProviderWordmark";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";
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
  { id: "Decision", line: "What to do next", tip: "€273 variance" },
  { id: "Futures", line: "What is likely", tip: "Wait 12m" },
  { id: "Action", line: "What RADR prepared", tip: "Evidence package" },
  { id: "Verified", line: "What closed", tip: "€273 recovered" },
  { id: "Memory", line: "What was learned", tip: "Pattern retained" },
] as const;

const PACKETS = [
  { label: "INVOICE", value: "INV-88421" },
  { label: "PAYMENT", value: "€8,412.20" },
  { label: "RESERVATIONS", value: "38 inbound" },
  { label: "CONTRACT", value: "€6.80/L" },
  { label: "DELIVERY", value: "+31%" },
] as const;

const DOMAIN_SLOTS: { id: string; area: string; label?: string }[] = [
  { id: "restaurant", area: "src-a", label: "Restaurant" },
  { id: "hotel", area: "src-b", label: "Hotel" },
  { id: "finance", area: "src-d", label: "Finance" },
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
  const uid = useId();
  const [hotId, setHotId] = useState<string | null>(null);
  const [packetIdx, setPacketIdx] = useState(0);
  const [pulseOut, setPulseOut] = useState(0);
  const hot = hotId ? providerById(hotId) : null;

  const payments = visibleInGroup("payments");
  const custom = visibleInGroup("custom");
  const finance = [...visibleInGroup("finance"), ...payments];

  function providersFor(id: string) {
    return id === "finance" ? finance : visibleInGroup(id);
  }

  const hotArea =
    DOMAIN_SLOTS.find((s) => providersFor(s.id).some((p) => p.id === hotId))
      ?.area ?? (hotId && custom.some((p) => p.id === hotId) ? "src-e" : null);

  useEffect(() => {
    if (reduced) return;
    const t = window.setInterval(() => {
      setPacketIdx((i) => (i + 1) % PACKETS.length);
      setPulseOut((i) => (i + 1) % OUTPUTS.length);
    }, 3200);
    return () => window.clearInterval(t);
  }, [reduced]);

  const packet = PACKETS[packetIdx]!;

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

      <div
        className="rx-intake-stage"
        data-hot={hotId ?? undefined}
        data-hot-area={hotArea ?? undefined}
        data-reduced={reduced ? "true" : undefined}
        data-pulse={pulseOut}
        aria-label="Signal intake"
      >
        <div className="rx-intake-atmosphere" aria-hidden="true" />
        <IntakeField
          uid={uid}
          hotArea={hotArea}
          reduced={reduced}
          packet={packet}
        />

        <div className="rx-intake-sources">
          {DOMAIN_SLOTS.map((slot) => {
            const g = HOME_CONNECTION_GROUPS.find((x) => x.id === slot.id)!;
            return (
              <SourceCluster
                key={slot.id}
                area={slot.area}
                label={slot.label ?? g.label}
                providers={providersFor(slot.id)}
                hotId={hotId}
                onHot={setHotId}
              />
            );
          })}
          <div className="rx-intake-cluster" data-area="src-e">
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

        <div className="rx-intake-core" data-react={reduced ? undefined : "true"}>
          {!reduced ? <span className="rx-intake-core-ring" aria-hidden="true" /> : null}
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
            <p className="rx-intake-core-k">Decision core</p>
          </div>
        </div>

        <div className="rx-intake-out" aria-label="RADR outputs">
          {OUTPUTS.map((o, i) => (
            <div
              key={o.id}
              className="rx-intake-primitive"
              data-tone={o.id === "Verified" ? "verified" : undefined}
              data-live={i === pulseOut ? "true" : undefined}
              title={o.tip}
            >
              <strong>{o.id}</strong>
              <em className="rx-intake-tip">{o.tip}</em>
              <span className="rx-intake-hint">{o.line}</span>
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
    <div className="rx-intake-cluster" data-area={area}>
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

function IntakeField({
  uid,
  hotArea,
  reduced,
  packet,
}: {
  uid: string;
  hotArea: string | null;
  reduced: boolean;
  packet: (typeof PACKETS)[number];
}) {
  const paths: Record<string, string> = {
    "src-a": "M 90 120 C 200 160, 280 220, 400 300",
    "src-b": "M 710 120 C 600 160, 520 220, 400 300",
    "src-d": "M 700 460 C 600 400, 520 340, 400 300",
    "src-e": "M 400 540 C 400 460, 400 380, 400 300",
  };
  const activePath = hotArea && paths[hotArea] ? paths[hotArea] : paths["src-a"]!;

  return (
    <svg
      className="rx-intake-field"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="48%" r="42%">
          <stop offset="0%" stopColor="rgba(0,217,120,0.14)" />
          <stop offset="50%" stopColor="rgba(0,217,120,0.04)" />
          <stop offset="100%" stopColor="rgba(0,217,120,0)" />
        </radialGradient>
        <linearGradient id={`${uid}-flow`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(10,13,11,0.06)" />
          <stop offset="100%" stopColor="rgba(0,168,90,0.55)" />
        </linearGradient>
      </defs>
      <circle cx="400" cy="300" r="210" fill={`url(#${uid}-glow)`} />
      {Object.entries(paths).map(([area, d]) => (
        <path
          key={area}
          className="rx-intake-beam"
          data-on={hotArea === area ? "true" : undefined}
          d={d}
          fill="none"
          stroke={
            hotArea === area ? `url(#${uid}-flow)` : "rgba(10,13,11,0.07)"
          }
          strokeWidth={hotArea === area ? 1.75 : 1}
          strokeLinecap="round"
        />
      ))}
      {!reduced ? (
        <g className="rx-intake-packet">
          <rect
            x="-46"
            y="-14"
            width="92"
            height="28"
            rx="8"
            fill="rgba(255,255,255,0.94)"
            stroke="rgba(10,13,11,0.1)"
          />
          <text
            x="0"
            y="-2"
            textAnchor="middle"
            fill="#8a918d"
            fontSize="7"
            fontFamily="ui-monospace, monospace"
            letterSpacing="0.08em"
          >
            {packet.label}
          </text>
          <text
            x="0"
            y="10"
            textAnchor="middle"
            fill="#0a0d0b"
            fontSize="9"
            fontFamily="ui-monospace, monospace"
            fontWeight="600"
          >
            {packet.value}
          </text>
          <animateMotion
            key={packet.label}
            dur="3.1s"
            repeatCount="indefinite"
            path={activePath}
          />
        </g>
      ) : null}
    </svg>
  );
}
