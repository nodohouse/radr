"use client";

/**
 * Data origin — capability map.
 * Sources → RADR → Decisions. Honest access. Potential signals only.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import NextLink from "next/link";
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
import { CTAS } from "@/lib/marketing/brand";
import { capabilityBadge } from "@/lib/marketing/capabilityStatus";

const CUSTOM_EVIDENCE = [
  "Invoices",
  "Contracts",
  "Credit memos",
  "CSV",
] as const;

const OUTPUTS = [
  { id: "Decision" },
  { id: "Futures" },
  { id: "Action" },
  { id: "Verified Value" },
  { id: "Memory" },
] as const;

/** Illustrative raw signals → Decision (category story, not live data) */
const SIGNAL_BRIDGE = [
  { src: "Toast", value: "€42,910 sales" },
  { src: "OpenTable", value: "412 covers" },
  { src: "Adyen", value: "€41,884 settled" },
  { src: "Weather", value: "rain 19:00" },
  { src: "Events", value: "arena 22:00" },
  { src: "Google", value: "directions +28%" },
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
    <div className="rx-intake" ref={rootRef}>
      <header className="rx-intake-head">
        <p className="rx-rec-k">Data origin</p>
        <h2 className="rx-intake-h">
          Your systems already hold the evidence.
          <span>RADR connects it into Decisions.</span>
        </h2>
        <p className="rx-intake-lead">
          RADR brings operational, financial and contextual signals into one
          Decision layer — then connects them to find value no single system can
          see alone.
        </p>
        <p className="rx-intake-honesty">
          Representative systems. Connection availability varies. First pilots
          start with secure exports and documents — invoices, contracts, credit
          memos, payments, supplier statements, CSV / accounting exports. APIs
          later where useful.
        </p>
      </header>

      <div className="rx-intake-map" aria-label="Representative connection map">
        <div className="rx-intake-groups">
          {HOME_CAPABILITY_GROUPS.map((group) => (
            <div key={group.id} className="rx-intake-group">
              <p className="rx-intake-group-label">{group.label}</p>
              <ul className="rx-intake-chips">
                {group.providerIds.map((id) => {
                  if (id === "google-stack") {
                    return (
                      <li key="google-stack">
                        <GoogleStackChip
                          active={active}
                          setActive={setActive}
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

          <div className="rx-intake-group">
            <p className="rx-intake-group-label">Custom evidence</p>
            <ul className="rx-intake-evidence">
              {CUSTOM_EVIDENCE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {providerById("files-csv") ? (
              <ul className="rx-intake-chips" style={{ marginTop: "0.55rem" }}>
                <li>
                  <ProviderChip
                    provider={providerById("files-csv")!}
                    selected={
                      active?.kind === "provider" && active.id === "files-csv"
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

        {(popoverProvider && popoverStory) || active?.kind === "google-stack" ? (
          <CapabilityPopover
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

      <div className="rx-intake-bridge" aria-label="Signals become Decisions">
        <div className="rx-intake-bridge-signals">
          <p className="rx-intake-bridge-k">Signals</p>
          <ul>
            {SIGNAL_BRIDGE.map((s) => (
              <li key={s.src}>
                <em>{s.src}</em>
                <strong>{s.value}</strong>
              </li>
            ))}
          </ul>
        </div>
        <div className="rx-intake-bridge-core" aria-hidden="true">
          <span className="rx-intake-delta">
            <svg viewBox="0 0 100 90" width="40" height="34">
              <path
                d="M50 8 L90 81 H10 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="11"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <strong>RADR</strong>
        </div>
        <div className="rx-intake-bridge-out">
          <p className="rx-intake-bridge-k">Decision</p>
          <div className="rx-intake-bridge-decision">
            <em>D-1911 · DEMO</em>
            <strong>Wait 12 minutes</strong>
            <span>€620 expected incremental vs seat-now</span>
          </div>
          <ul className="rx-intake-out-mini" aria-label="RADR outputs">
            {OUTPUTS.map((o) => (
              <li key={o.id}>{o.id}</li>
            ))}
          </ul>
        </div>
      </div>

      <NextLink href="/developers#integrations" className="rx-intake-more">
        View all connection paths <span aria-hidden="true">→</span>
        <em className="rx-intake-more-status">
          Files / CSV · {capabilityBadge("filesCsv")} · {CTAS.viewConnectionStatus}
        </em>
      </NextLink>
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
      aria-label={`${provider.name}, ${accessStatusLabel(provider)}. Show potential signals.`}
      data-on={selected ? "true" : undefined}
      data-status={provider.status}
      data-provider-brand={provider.id.split("-")[0]}
      onMouseEnter={onOpen}
      onFocus={onOpen}
      onClick={onOpen}
    >
      <ProviderWordmark id={provider.id} name={provider.name} />
    </button>
  );
}

function GoogleStackChip({
  active,
  setActive,
}: {
  active: ActiveTarget;
  setActive: (t: ActiveTarget) => void;
}) {
  const open =
    active?.kind === "google-stack" || active?.kind === "google-child";
  return (
    <button
      type="button"
      className="rx-intake-chip rx-intake-chip-google"
      aria-expanded={open}
      aria-label="Google stack: Business Profile, Analytics, Search Console, Places. Show details."
      data-on={open ? "true" : undefined}
      onMouseEnter={() => setActive({ kind: "google-stack" })}
      onFocus={() => setActive({ kind: "google-stack" })}
      onClick={() => setActive({ kind: "google-stack" })}
    >
      <ProviderWordmark id="google-stack" name="Google" />
    </button>
  );
}

function CapabilityPopover({
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
      <div
        className="rx-cap-pop"
        role="dialog"
        aria-labelledby={titleId}
      >
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
              Local demand · marketing · search · place context
              <em data-status="planned">External data</em>
            </p>
          </div>
        </header>
        <p className="rx-cap-pop-caveat">
          One tile, four sources. Access and fields depend on Google products
          and customer authorization. Not live connectors.
        </p>
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
      </div>
    );
  }

  if (!provider || !story) return null;

  return (
    <div className="rx-cap-pop" role="dialog" aria-labelledby={titleId}>
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
          <p className="rx-cap-pop-k">Potential signals</p>
          <ul>
            {story.potentialSignals.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="rx-cap-pop-k">Combine with</p>
          <p className="rx-cap-pop-combine">{story.combineWith}</p>
          <p className="rx-cap-pop-k">RADR could see</p>
          <ul className="rx-cap-pop-see">
            {story.radrCouldSee.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      {provider.notes ? (
        <p className="rx-cap-pop-caveat">{provider.notes}</p>
      ) : null}
    </div>
  );
}
