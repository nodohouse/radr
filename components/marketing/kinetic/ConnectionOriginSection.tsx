"use client";

/**
 * Operating signal map — catalog-backed constellation.
 * Monochrome provider marks + orbital field. Status/methods from registry only.
 */

import { useId, useState } from "react";
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

const MAP_SLOTS: {
  id: string;
  area: string;
  label?: string;
  glyph: "plate" | "key" | "stay" | "ledger";
}[] = [
  { id: "restaurant", area: "nw", glyph: "plate" },
  { id: "hotel", area: "ne", glyph: "key" },
  { id: "serviced", area: "sw", glyph: "stay" },
  { id: "finance", area: "se", label: "Finance & payments", glyph: "ledger" },
];

/** Short marks for visual weight — not brand logos */
const MARK: Record<string, string> = {
  toast: "To",
  "lightspeed-restaurant": "Ls",
  square: "Sq",
  opentable: "Ot",
  sevenrooms: "7r",
  deliveroo: "Dr",
  "uber-eats": "Ue",
  mews: "Mw",
  apaleo: "Ap",
  "oracle-opera-cloud": "Op",
  siteminder: "Sm",
  "booking-connectivity": "Bk",
  guesty: "Gy",
  hostaway: "Hw",
  hospitable: "Hp",
  xero: "Xe",
  "quickbooks-online": "Qb",
  stripe: "St",
  mollie: "Mo",
  "files-csv": "··",
  "byod-warehouse": "Wh",
};

function markFor(p: IntegrationProvider): string {
  return MARK[p.id] ?? p.name.slice(0, 2);
}

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
    MAP_SLOTS.find((s) => providersFor(s.id).some((p) => p.id === hotId))
      ?.area ?? (hotId && custom.some((p) => p.id === hotId) ? "custom" : null);

  return (
    <div className="rx-sigmap">
      <header className="rx-sigmap-head">
        <p className="rx-rec-k">Data origin</p>
        <h2 className="rx-rec-h">Connect what already runs your operation.</h2>
        <p className="rx-rec-p rx-rec-muted">
          RADR turns operational and financial signals from the systems already
          in use into one decision-ready operating state.
        </p>
      </header>

      <div
        className="rx-sigmap-stage"
        data-hot={hotId ?? undefined}
        data-hot-area={hotArea ?? undefined}
        data-reduced={reduced ? "true" : undefined}
        aria-label="Operating signal map"
      >
        <SigMapField uid={uid} hotArea={hotArea} reduced={reduced} />

        {MAP_SLOTS.map((slot) => {
          const g = HOME_CONNECTION_GROUPS.find((x) => x.id === slot.id)!;
          return (
            <Cluster
              key={slot.id}
              area={slot.area}
              label={slot.label ?? g.label}
              glyph={slot.glyph}
              providers={providersFor(slot.id)}
              hotId={hotId}
              onHot={setHotId}
            />
          );
        })}

        <div className="rx-sigmap-core">
          {hot && !reduced ? (
            <span className="rx-sigmap-pulse" aria-hidden="true" />
          ) : null}
          <div className="rx-sigmap-core-inner">
            <span className="rx-sigmap-delta" aria-hidden="true">
              <svg viewBox="0 0 100 90" width="28" height="24">
                <path
                  d="M50 8 L90 81 H10 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <RadrWordmark surface="light" size="md" compact />
            <p className="rx-sigmap-state">Normalized operating state</p>
            <ul className="rx-sigmap-out">
              {SIGNAL_MAP_OUTPUTS.map((o) => (
                <li
                  key={o}
                  data-tone={o === "Verified Value" ? "verified" : undefined}
                >
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Cluster
          area="custom"
          label="Custom data"
          glyph="ledger"
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
                        <i aria-hidden="true">{markFor(p)}</i>
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
          <span className="rx-sigmap-card-mark" aria-hidden="true">
            {markFor(hot)}
          </span>
          <div>
            <strong>{hot.name}</strong>
            <em data-status={hot.status}>{statusLabel(hot)}</em>
          </div>
          <span>{connectionMethodLabel(hot)}</span>
          <p className="rx-sigmap-path">
            {hot.name}
            <span aria-hidden="true"> → </span>
            {connectionMethodLabel(hot)}
            <span aria-hidden="true"> → </span>
            RADR
            <span aria-hidden="true"> → </span>
            Decision
          </p>
        </div>
      ) : null}

      <NextLink href="/developers#integrations" className="rx-sigmap-more">
        Explore {CATALOG_COUNT} connection paths{" "}
        <span aria-hidden="true">→</span>
      </NextLink>
    </div>
  );
}

function SigMapField({
  uid,
  hotArea,
  reduced,
}: {
  uid: string;
  hotArea: string | null;
  reduced: boolean;
}) {
  const paths: Record<string, string> = {
    nw: "M 120 140 C 220 180, 280 240, 400 300",
    ne: "M 680 140 C 580 180, 520 240, 400 300",
    sw: "M 140 460 C 220 420, 280 360, 400 300",
    se: "M 660 460 C 580 420, 520 360, 400 300",
    custom: "M 400 520 C 400 460, 400 380, 400 300",
  };

  return (
    <svg
      className="rx-sigmap-field"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="45%">
          <stop offset="0%" stopColor="rgba(0,217,120,0.12)" />
          <stop offset="55%" stopColor="rgba(0,217,120,0.03)" />
          <stop offset="100%" stopColor="rgba(0,217,120,0)" />
        </radialGradient>
        <linearGradient id={`${uid}-path`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(10,13,11,0.08)" />
          <stop offset="100%" stopColor="rgba(0,168,90,0.55)" />
        </linearGradient>
      </defs>
      <circle cx="400" cy="300" r="210" fill={`url(#${uid}-glow)`} />
      <circle
        className="rx-sigmap-orbit rx-sigmap-orbit--spin"
        cx="400"
        cy="300"
        r="168"
        fill="none"
        stroke="rgba(10,13,11,0.07)"
        strokeWidth="1"
        strokeDasharray="3 10"
      />
      <circle
        className="rx-sigmap-orbit"
        cx="400"
        cy="300"
        r="118"
        fill="none"
        stroke="rgba(10,13,11,0.06)"
        strokeWidth="1"
      />
      <circle
        className="rx-sigmap-orbit"
        cx="400"
        cy="300"
        r="72"
        fill="none"
        stroke="rgba(0,168,90,0.18)"
        strokeWidth="1"
      />
      {Object.entries(paths).map(([area, d]) => (
        <path
          key={area}
          className="rx-sigmap-beam"
          data-on={hotArea === area ? "true" : undefined}
          d={d}
          fill="none"
          stroke={
            hotArea === area ? `url(#${uid}-path)` : "rgba(10,13,11,0.05)"
          }
          strokeWidth={hotArea === area ? 1.6 : 1}
          strokeLinecap="round"
        />
      ))}
      {!reduced && hotArea ? (
        <circle r="3.5" fill="#00a85a" opacity="0.85">
          <animateMotion
            dur="1.4s"
            repeatCount="indefinite"
            path={paths[hotArea]}
          />
        </circle>
      ) : null}
    </svg>
  );
}

function ClusterGlyph({ kind }: { kind: "plate" | "key" | "stay" | "ledger" }) {
  if (kind === "plate") {
    return (
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "key") {
    return (
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path
          d="M8 14.5a3.5 3.5 0 1 1 3.2-4.8L18 7l1.5 1.5-2 1 1 2-2 .8-.9-1.6-3.2 2A3.5 3.5 0 0 1 8 14.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === "stay") {
    return (
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path
          d="M4 18V9.5L12 5l8 4.5V18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M9 18v-5h6v5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <rect x="5" y="4" width="14" height="16" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Cluster({
  area,
  label,
  glyph,
  providers,
  hotId,
  onHot,
}: {
  area: string;
  label: string;
  glyph: "plate" | "key" | "stay" | "ledger";
  providers: IntegrationProvider[];
  hotId: string | null;
  onHot: (id: string | null) => void;
}) {
  return (
    <div className="rx-sigmap-cluster" data-area={area}>
      <p>
        <ClusterGlyph kind={glyph} />
        <span>{label}</span>
      </p>
      <ul>
        {providers.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              aria-label={`${p.name}, ${statusLabel(p)}`}
              data-on={hotId === p.id ? "true" : undefined}
              data-status={p.status}
              onMouseEnter={() => onHot(p.id)}
              onMouseLeave={() => onHot(null)}
              onFocus={() => onHot(p.id)}
              onBlur={() => onHot(null)}
              onClick={() => onHot(p.id)}
            >
              <span className="rx-sigmap-mark" aria-hidden="true">
                {markFor(p)}
              </span>
              <span className="rx-sigmap-name">{p.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
