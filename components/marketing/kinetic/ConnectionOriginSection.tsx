"use client";

/**
 * Data Origin — three layers at rest.
 * Sources → △ RADR → Decision primitives.
 * Richness lives in hover / focus cards only.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Link } from "@/i18n/navigation";
import { ProviderWordmark } from "@/components/marketing/kinetic/ProviderWordmark";
import {
  HOME_CAPABILITY_GROUPS,
  providerById,
} from "@/lib/marketing/homeConnections";
import type { IntegrationProvider } from "@/lib/integrations/registry";
import {
  accessStatusLabel,
  capabilityStoryFor,
  categoryLabel,
  GOOGLE_STACK_IDS,
  type CapabilityStory,
} from "@/lib/integrations/capabilityStory";
import { capabilityBadge } from "@/lib/marketing/capabilityStatus";

const CUSTOM_EVIDENCE = [
  "Invoices",
  "Contracts",
  "Credit memos",
  "CSV",
] as const;

const OUTPUTS = [
  "Decision",
  "Futures",
  "Action",
  "Verified Value",
  "Memory",
] as const;

type ActiveTarget =
  | { kind: "provider"; id: string }
  | { kind: "google-stack" }
  | { kind: "google-child"; id: string }
  | null;

export function ConnectionOriginSection() {
  const [active, setActive] = useState<ActiveTarget>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [close]);

  const popoverProvider =
    active?.kind === "provider" || active?.kind === "google-child"
      ? providerById(active.id)
      : null;
  const popoverStory = popoverProvider
    ? capabilityStoryFor(popoverProvider.id)
    : null;

  return (
    <div className="rx-intake rx-intake--calm" ref={rootRef}>
      <header className="rx-intake-head">
        <p className="rx-rec-k">Data origin</p>
        <h2 className="rx-intake-h">
          Your systems already hold the evidence.
          <span>RADR connects it into Decisions.</span>
        </h2>
        <p className="rx-intake-lead">
          Operational, financial and contextual signals into one Decision layer —
          so value no single system can see alone becomes actionable.
        </p>
        <p className="rx-intake-honesty">
          Representative systems. Connection availability varies. First pilots
          start with secure exports and documents. APIs later where useful.
        </p>
      </header>

      <div className="rx-intake-triad" aria-label="Evidence to Decision">
        {/* LAYER 1 — sources */}
        <div className="rx-intake-layer rx-intake-layer--src">
          <p className="rx-intake-layer-k">Source systems</p>
          <div className="rx-intake-src-grid">
            {HOME_CAPABILITY_GROUPS.map((group) => (
              <div key={group.id} className="rx-intake-src-col">
                <p className="rx-intake-group-label">{group.label}</p>
                <ul className="rx-intake-chips">
                  {group.providerIds.map((id) => {
                    if (id === "google-stack") {
                      return (
                        <li key="google-stack">
                          <GoogleStackChip
                            open={
                              active?.kind === "google-stack" ||
                              active?.kind === "google-child"
                            }
                            onOpen={() =>
                              setActive({ kind: "google-stack" })
                            }
                          />
                        </li>
                      );
                    }
                    const p = providerById(id);
                    if (!p) return null;
                    return (
                      <li key={id}>
                        <ProviderChip
                          provider={p}
                          selected={
                            active?.kind === "provider" && active.id === id
                          }
                          onOpen={() =>
                            setActive({ kind: "provider", id })
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            <div className="rx-intake-src-col">
              <p className="rx-intake-group-label">Custom evidence</p>
              <ul className="rx-intake-evidence">
                {CUSTOM_EVIDENCE.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {providerById("files-csv") ? (
                <ul className="rx-intake-chips" style={{ marginTop: "0.45rem" }}>
                  <li>
                    <ProviderChip
                      provider={providerById("files-csv")!}
                      selected={
                        active?.kind === "provider" &&
                        active.id === "files-csv"
                      }
                      onOpen={() =>
                        setActive({ kind: "provider", id: "files-csv" })
                      }
                    />
                  </li>
                </ul>
              ) : null}
            </div>
          </div>

          {(popoverProvider && popoverStory) ||
          active?.kind === "google-stack" ? (
            <CapabilityCard
              provider={popoverProvider}
              story={popoverStory}
              googleExpanded={active?.kind === "google-stack"}
              onSelectGoogleChild={(id) =>
                setActive({ kind: "google-child", id })
              }
              onClose={close}
            />
          ) : null}
        </div>

        <div className="rx-intake-connector" aria-hidden="true">
          <i />
        </div>

        {/* LAYER 2 — RADR */}
        <div className="rx-intake-layer rx-intake-layer--core">
          <div className="rx-intake-delta-only">
            <span className="rx-intake-delta" aria-hidden="true">
              <svg viewBox="0 0 100 90" width="56" height="48">
                <path
                  d="M50 8 L90 81 H10 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="11"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p>RADR</p>
            <em>Decision layer</em>
          </div>
        </div>

        <div className="rx-intake-connector" aria-hidden="true">
          <i />
        </div>

        {/* LAYER 3 — outputs */}
        <div className="rx-intake-layer rx-intake-layer--out">
          <p className="rx-intake-layer-k">Decision formed</p>
          <ul className="rx-intake-primitives" aria-label="RADR outputs">
            {OUTPUTS.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
      </div>

      <Link href="/developers#integrations" className="rx-intake-more">
        View all connection paths <span aria-hidden="true">→</span>
        <em className="rx-intake-more-status">
          Files / CSV · {capabilityBadge("filesCsv")}
        </em>
      </Link>
    </div>
  );
}

function ProviderChip({
  provider,
  selected,
  onOpen,
}: {
  provider: IntegrationProvider;
  selected: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className="rx-intake-chip"
      aria-expanded={selected}
      aria-label={`${provider.name}, ${accessStatusLabel(provider)}. Possible evidence.`}
      data-on={selected ? "true" : undefined}
      data-status={provider.status}
      onMouseEnter={onOpen}
      onFocus={onOpen}
      onClick={onOpen}
    >
      <ProviderWordmark id={provider.id} name={provider.name} />
    </button>
  );
}

function GoogleStackChip({
  open,
  onOpen,
}: {
  open: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className="rx-intake-chip rx-intake-chip-google"
      aria-expanded={open}
      aria-label="Google: Business Profile, Analytics, Search Console, Maps Routes. Show details."
      data-on={open ? "true" : undefined}
      onMouseEnter={onOpen}
      onFocus={onOpen}
      onClick={onOpen}
    >
      <ProviderWordmark id="google-stack" name="Google" />
    </button>
  );
}

function CapabilityCard({
  provider,
  story,
  googleExpanded,
  onSelectGoogleChild,
  onClose,
}: {
  provider: IntegrationProvider | null | undefined;
  story: CapabilityStory | null | undefined;
  googleExpanded: boolean;
  onSelectGoogleChild: (id: string) => void;
  onClose: () => void;
}) {
  const titleId = useId();

  if (googleExpanded && !provider) {
    return (
      <div className="rx-cap-card" role="dialog" aria-labelledby={titleId}>
        <button
          type="button"
          className="rx-cap-pop-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <header className="rx-cap-pop-head">
          <ProviderWordmark id="google-stack" name="Google" />
          <div>
            <h3 id={titleId}>Google</h3>
            <p>
              Separate products · customer authorization required
              <em>External data</em>
            </p>
          </div>
        </header>
        <ul className="rx-cap-pop-google">
          {GOOGLE_STACK_IDS.map((id) => {
            const p = providerById(id);
            if (!p) return null;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onSelectGoogleChild(id)}
                  onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectGoogleChild(id);
                    }
                  }}
                >
                  <strong>{p.name}</strong>
                  <span>{accessStatusLabel(p)}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="rx-cap-pop-caveat">
          Does not include Popular Times or live footfall. Places / Routes are
          contextual sources only.
        </p>
      </div>
    );
  }

  if (!provider || !story) return null;

  return (
    <div className="rx-cap-card" role="dialog" aria-labelledby={titleId}>
      <button
        type="button"
        className="rx-cap-pop-close"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <header className="rx-cap-pop-head">
        <ProviderWordmark id={provider.id} name={provider.name} />
        <div>
          <h3 id={titleId}>{provider.name}</h3>
          <p>
            {categoryLabel(provider)}
            <em data-status={provider.status}>{accessStatusLabel(provider)}</em>
          </p>
        </div>
      </header>
      <div className="rx-cap-pop-grid">
        <div>
          <p className="rx-cap-pop-k">Possible evidence</p>
          <ul>
            {story.potentialSignals.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="rx-cap-pop-k">RADR can use it for</p>
          <ul className="rx-cap-pop-see">
            {story.radrCouldSee.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="rx-cap-pop-k" style={{ marginTop: "0.75rem" }}>
            Status
          </p>
          <p className="rx-cap-pop-combine">{accessStatusLabel(provider)}</p>
        </div>
      </div>
    </div>
  );
}
