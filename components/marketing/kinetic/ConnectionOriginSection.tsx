"use client";

/**
 * Data Origin — Sources → △ RADR → Decision.
 * Two seconds at rest. Provenance only on interaction.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Link } from "@/i18n/navigation";
import { ProviderWordmark } from "@/components/marketing/kinetic/ProviderWordmark";
import {
  HOME_RESTING_PROVIDER_IDS,
  providerById,
} from "@/lib/marketing/homeConnections";
import type { IntegrationProvider } from "@/lib/integrations/registry";
import {
  accessStatusLabel,
  capabilityStoryFor,
  type CapabilityStory,
} from "@/lib/integrations/capabilityStory";
import { capabilityBadge } from "@/lib/marketing/capabilityStatus";
import { RadrDelta } from "@/components/radr/RadrDelta";
import "@/app/radr-public.css";

const DECISION_CHILDREN = [
  "Futures",
  "Action",
  "Verified Value",
  "Memory",
] as const;

export function ConnectionOriginSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setActiveId(null), []);

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

  const provider = activeId ? providerById(activeId) : null;
  const story = provider ? capabilityStoryFor(provider.id) : null;
  const lit = Boolean(activeId);

  return (
    <div
      className="rx-origin"
      ref={rootRef}
      data-lit={lit ? "true" : undefined}
    >
      <header className="rx-origin-head">
        <p className="rx-rec-k">Data origin</p>
        <h2 className="rx-origin-h">
          Source systems → RADR → Decision
        </h2>
      </header>

      <div className="rx-origin-triad" aria-label="Sources to Decision">
        <div className="rx-origin-zone rx-origin-zone--src">
          <p className="rx-origin-zone-k">Source systems</p>
          <ul className="rx-origin-logos">
            {HOME_RESTING_PROVIDER_IDS.map((id) => {
              const p = providerById(id);
              if (!p) return null;
              return (
                <li key={id}>
                  <button
                    type="button"
                    className="rx-origin-logo"
                    aria-expanded={activeId === id}
                    aria-label={`${p.name}, ${accessStatusLabel(p)}. Possible evidence.`}
                    data-on={activeId === id ? "true" : undefined}
                    onMouseEnter={() => setActiveId(id)}
                    onFocus={() => setActiveId(id)}
                    onClick={() =>
                      setActiveId((cur) => (cur === id ? null : id))
                    }
                  >
                    <ProviderWordmark id={p.id} name={p.name} />
                  </button>
                </li>
              );
            })}
          </ul>
          {provider && story ? (
            <OriginNote
              provider={provider}
              story={story}
              onClose={close}
            />
          ) : null}
        </div>

        <div className="rx-origin-flow" aria-hidden="true">
          <i data-arm="in" data-on={lit ? "true" : undefined} />
        </div>
        <p className="rx-origin-mobile-arrow" aria-hidden="true">
          ↓
        </p>

        <div className="rx-origin-zone rx-origin-zone--core">
          <div className="rx-origin-delta" data-on={lit ? "true" : undefined}>
            <RadrDelta variant="nav" height={56} className="rx-origin-delta-mark" />
            <strong>RADR</strong>
          </div>
        </div>

        <div className="rx-origin-flow" aria-hidden="true">
          <i data-arm="out" data-on={lit ? "true" : undefined} />
        </div>
        <p className="rx-origin-mobile-arrow" aria-hidden="true">
          ↓
        </p>

        <div className="rx-origin-zone rx-origin-zone--out">
          <p className="rx-origin-decision" data-on={lit ? "true" : undefined}>
            Decision
          </p>
          <ul className="rx-origin-children">
            {DECISION_CHILDREN.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      <Link
        href={{ pathname: "/developers", hash: "integrations" }}
        className="rx-origin-more"
      >
        View all connection paths <span aria-hidden="true">→</span>
      </Link>
      <p className="rx-origin-note">
        Files / CSV · {capabilityBadge("filesCsv")}
      </p>
    </div>
  );
}

function OriginNote({
  provider,
  story,
  onClose,
}: {
  provider: IntegrationProvider;
  story: CapabilityStory;
  onClose: () => void;
}) {
  const titleId = useId();
  return (
    <aside
      className="rx-origin-note-card"
      role="dialog"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="rx-origin-note-close"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <h3 id={titleId}>{provider.name}</h3>
      <p className="rx-origin-note-k">Evidence</p>
      <ul>
        {story.potentialSignals.slice(0, 5).map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
      <p className="rx-origin-note-k">RADR can use it for</p>
      <ul>
        {story.radrCouldSee.slice(0, 3).map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
      <p className="rx-origin-note-status">{accessStatusLabel(provider)}</p>
    </aside>
  );
}
