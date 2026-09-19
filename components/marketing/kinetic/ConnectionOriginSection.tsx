"use client";

/**
 * Signal intake — cinematic data origin.
 * Catalog-backed providers · curated marks · RADR Core · premium motion.
 */

import { useId, useState } from "react";
import NextLink from "next/link";
import { RadrWordmark } from "@/components/radr/RadrWordmark";
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

const CUSTOM_EVIDENCE = [
  "CSV",
  "Contracts",
  "Invoices",
  "Statements",
  "Rate cards",
  "Menus",
  "Policy docs",
] as const;

const OUTPUT_PRIMITIVES = [
  { id: "Decisions", mark: "01", line: "What to do next" },
  { id: "Futures", mark: "02", line: "What is likely" },
  { id: "Actions", mark: "03", line: "What RADR prepared" },
  { id: "Verified Value", mark: "04", line: "What closed" },
  { id: "Memory", mark: "05", line: "What the operation learned" },
] as const;

const DOMAIN_SLOTS: {
  id: string;
  area: string;
  label?: string;
}[] = [
  { id: "restaurant", area: "src-a" },
  { id: "hotel", area: "src-b" },
  { id: "serviced", area: "src-c" },
  { id: "finance", area: "src-d", label: "Finance & payments" },
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
  const [openGroup, setOpenGroup] = useState<string | null>(null);
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

  return (
    <div className="rx-intake">
      <header className="rx-intake-head">
        <p className="rx-rec-k">Data origin</p>
        <h2 className="rx-intake-h">
          The systems are there.
          <span>The economic truth is still fragmented.</span>
        </h2>
        <p className="rx-intake-lead">
          RADR brings financial and operational signals from the systems already
          in use into one decision-ready operating state — so value leaks can be
          found, acted on, and verified.
        </p>
      </header>

      <div
        className="rx-intake-stage"
        data-hot={hotId ?? undefined}
        data-hot-area={hotArea ?? undefined}
        data-reduced={reduced ? "true" : undefined}
        aria-label="Signal intake"
      >
        <div className="rx-intake-atmosphere" aria-hidden="true" />

        <IntakeField uid={uid} hotArea={hotArea} reduced={reduced} />

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
            <p>Custom evidence</p>
            <ul className="rx-intake-evidence">
              {CUSTOM_EVIDENCE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <ul className="rx-intake-chips">
              {custom.map((p) => (
                <li key={p.id}>
                  <ProviderChip
                    provider={p}
                    hotId={hotId}
                    onHot={setHotId}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rx-intake-core">
          {!reduced ? <span className="rx-intake-core-ring" aria-hidden="true" /> : null}
          <div className="rx-intake-core-card">
            <span className="rx-intake-delta" aria-hidden="true">
              <svg viewBox="0 0 100 90" width="36" height="30">
                <path
                  d="M50 8 L90 81 H10 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="11"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <RadrWordmark surface="light" size="md" compact />
            <p className="rx-intake-core-k">RADR Core</p>
            <p className="rx-intake-core-sub">Normalized operating state</p>
            <div className="rx-intake-lane" aria-hidden="true">
              <span>Signals</span>
              <i />
              <span>Evidence</span>
              <i />
              <span>State</span>
              <i />
              <span>Decision-ready</span>
            </div>
          </div>
        </div>

        <div className="rx-intake-out" aria-label="RADR outputs">
          <p className="rx-intake-out-k">Decision infrastructure</p>
          {OUTPUT_PRIMITIVES.map((o, i) => (
            <div
              key={o.id}
              className="rx-intake-primitive"
              data-tone={o.id === "Verified Value" ? "verified" : undefined}
              style={{ animationDelay: `${0.12 * i}s` }}
            >
              <span aria-hidden="true">{o.mark}</span>
              <div>
                <strong>{o.id}</strong>
                <em>{o.line}</em>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile accordion */}
      <div className="rx-intake-mobile">
        {HOME_CONNECTION_GROUPS.map((g) => {
          const providers = g.providerIds
            .map((id) => providerById(id))
            .filter((p): p is IntegrationProvider => Boolean(p));
          const open = openGroup === g.id;
          return (
            <div key={g.id} className="rx-intake-acc">
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
                        <ProviderWordmark id={p.id} name={p.name} />
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
            {connectionMethodLabel(hot)}
            <span aria-hidden="true"> → </span>
            RADR Core
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
}: {
  uid: string;
  hotArea: string | null;
  reduced: boolean;
}) {
  const paths: Record<string, string> = {
    "src-a": "M 90 120 C 200 160, 280 220, 400 300",
    "src-b": "M 710 120 C 600 160, 520 220, 400 300",
    "src-c": "M 100 460 C 200 400, 280 340, 400 300",
    "src-d": "M 700 460 C 600 400, 520 340, 400 300",
    "src-e": "M 400 540 C 400 460, 400 380, 400 300",
  };

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
      <circle cx="400" cy="300" r="230" fill={`url(#${uid}-glow)`} />
      <circle
        className="rx-intake-orbit"
        cx="400"
        cy="300"
        r="175"
        fill="none"
        stroke="rgba(10,13,11,0.06)"
        strokeWidth="1"
        strokeDasharray="2 12"
      />
      <circle
        cx="400"
        cy="300"
        r="118"
        fill="none"
        stroke="rgba(10,13,11,0.05)"
        strokeWidth="1"
      />
      <circle
        cx="400"
        cy="300"
        r="68"
        fill="none"
        stroke="rgba(0,168,90,0.22)"
        strokeWidth="1.2"
      />
      {Object.entries(paths).map(([area, d]) => (
        <path
          key={area}
          className="rx-intake-beam"
          data-on={hotArea === area ? "true" : undefined}
          d={d}
          fill="none"
          stroke={
            hotArea === area ? `url(#${uid}-flow)` : "rgba(10,13,11,0.06)"
          }
          strokeWidth={hotArea === area ? 1.75 : 1}
          strokeLinecap="round"
        />
      ))}
      {!reduced && hotArea && paths[hotArea] ? (
        <circle r="3.2" fill="#00a85a">
          <animateMotion
            dur="1.55s"
            repeatCount="indefinite"
            path={paths[hotArea]}
          />
        </circle>
      ) : null}
      {!reduced
        ? Object.entries(paths)
            .filter(([area]) => !hotArea || area === hotArea)
            .slice(0, hotArea ? 1 : 3)
            .map(([area, d], i) => (
              <circle
                key={`idle-${area}`}
                r="2"
                fill="rgba(0,168,90,0.35)"
                opacity={hotArea ? 1 : 0.45}
              >
                <animateMotion
                  dur={`${3.8 + i * 0.7}s`}
                  repeatCount="indefinite"
                  path={d}
                  begin={`${i * 0.9}s`}
                />
              </circle>
            ))
        : null}
    </svg>
  );
}
