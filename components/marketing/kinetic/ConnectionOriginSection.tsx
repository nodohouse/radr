"use client";

/**
 * Data Origin — YOUR SYSTEMS → △ RADR → DECISION.
 * Condensed architecture. Inspector appears only on hover/pin — wider cinematic field.
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { RadrDelta } from "@/components/radr/RadrDelta";
import { ProviderWordmark } from "@/components/marketing/kinetic/ProviderWordmark";
import {
  CATALOG_COUNT,
  exampleDecisionHrefForSystem,
  homepageFeaturedGroups,
  homepageFeaturedSystems,
  type HomepageFeaturedSystem,
} from "@/lib/integrations/homepagePresentation";
import "@/app/radr-public.css";

const DECISION_CHILDREN = [
  { label: "Futures", note: "Compare paths before you act" },
  { label: "Action", note: "Prepare · approve · execute" },
  { label: "Verified Value", note: "Proof after reality" },
  { label: "Memory", note: "What the operation learned" },
] as const;

export function ConnectionOriginSection() {
  const systems = useMemo(() => homepageFeaturedSystems(), []);
  const groups = useMemo(() => homepageFeaturedGroups(), []);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const activeId = pinnedId ?? hoverId;
  const active = systems.find((s) => s.id === activeId) ?? null;
  const lit = Boolean(active);

  const reset = useCallback(() => {
    setPinnedId(null);
    setHoverId(null);
  }, []);

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") reset();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reset]);

  const select = (id: string, pin: boolean) => {
    if (pin) {
      setPinnedId((cur) => (cur === id ? null : id));
      setHoverId(id);
    } else {
      setHoverId(id);
    }
  };

  return (
    <div
      className="rx-origin"
      ref={rootRef}
      data-lit={lit ? "true" : undefined}
      onMouseLeave={() => {
        if (!pinnedId) setHoverId(null);
      }}
    >
      <header className="rx-origin-head">
        <p className="rx-rec-k">Your systems</p>
        <h2 className="rx-origin-h">
          <span className="rx-origin-h-line">Connect what you already run.</span>
          <span className="rx-origin-h-line">Everything RADR needs.</span>
          <span className="rx-origin-h-line">Nothing you need to replace.</span>
        </h2>
        <p className="rx-origin-honesty">
          Representative systems · availability varies by integration
        </p>
      </header>

      <div className="rx-origin-arch" aria-label="Systems to Decision">
        <div className="rx-origin-zone rx-origin-zone--src">
          <p className="rx-origin-zone-k">Your systems</p>
          <div className="rx-origin-groups">
            {groups.map((g) => (
              <div key={g.id} className="rx-origin-group">
                <p className="rx-origin-group-k">{g.label}</p>
                <ul className="rx-origin-systems">
                  {g.systems.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        className="rx-origin-sys"
                        aria-pressed={pinnedId === s.id}
                        data-on={activeId === s.id ? "true" : undefined}
                        style={
                          {
                            "--sys-brand": s.brandColor,
                          } as CSSProperties
                        }
                        onMouseEnter={() => setHoverId(s.id)}
                        onFocus={() => setHoverId(s.id)}
                        onClick={() => select(s.id, true)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            select(s.id, true);
                          }
                        }}
                      >
                        <span className="rx-origin-sys-mark">
                          <ProviderWordmark
                            id={s.id}
                            name={s.label}
                            className="rx-origin-pwm"
                          />
                        </span>
                        <i
                          className="rx-origin-brand-dot"
                          aria-hidden="true"
                          style={{ background: s.brandColor }}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="rx-origin-bridge" aria-hidden="true">
          <span className="rx-origin-arrow" data-on={lit ? "true" : undefined} />
          <div className="rx-origin-delta" data-on={lit ? "true" : undefined}>
            <RadrDelta
              variant="nav"
              height={72}
              className="rx-origin-delta-mark"
            />
            <strong>RADR</strong>
          </div>
          <span className="rx-origin-arrow" data-on={lit ? "true" : undefined} />
        </div>

        <div className="rx-origin-zone rx-origin-zone--out">
          <p className="rx-origin-zone-k">What RADR forms</p>
          <p className="rx-origin-decision" data-on={lit ? "true" : undefined}>
            Decision
          </p>
          <ul className="rx-origin-children">
            {DECISION_CHILDREN.map((c, i) => (
              <li key={c.label} data-on={lit ? "true" : undefined}>
                <em aria-hidden="true">{String(i + 1).padStart(2, "0")}</em>
                <div>
                  <strong>{c.label}</strong>
                  <span>{c.note}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Inspector only when a system is hovered or pinned — no empty box. */}
      <div
        className="rx-origin-inspector-below"
        data-open={active ? "true" : undefined}
        aria-hidden={!active}
      >
        {active ? (
          <IntegrationInspector
            active={active}
            pinned={Boolean(pinnedId)}
          />
        ) : null}
      </div>

      <p className="rx-origin-catalog-wrap">
        <Link
          href={{ pathname: "/developers", hash: "integrations" }}
          className="rx-origin-catalog"
        >
          View all {CATALOG_COUNT} integrations{" "}
          <span aria-hidden="true">→</span>
        </Link>
      </p>
    </div>
  );
}

function IntegrationInspector({
  active,
  pinned,
}: {
  active: HomepageFeaturedSystem;
  pinned: boolean;
}) {
  const titleId = useId();
  const exampleHref = exampleDecisionHrefForSystem(active.id);

  return (
    <aside
      className="rx-origin-inspector"
      data-pinned={pinned ? "true" : undefined}
      aria-labelledby={titleId}
    >
      <div className="rx-origin-inspector-grid">
        <div className="rx-origin-inspector-lead">
          <p className="rx-origin-inspector-k">System</p>
          <h3 id={titleId}>{active.label}</h3>
          <p className="rx-origin-inspector-status">{active.statusLabel}</p>
          {active.provider.notes ? (
            <p className="rx-origin-inspector-notes">{active.provider.notes}</p>
          ) : null}
        </div>
        <div>
          <p className="rx-origin-note-k">Possible evidence</p>
          <ul>
            {active.possibleEvidence.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="rx-origin-note-k">RADR can use it for</p>
          <ul>
            {active.radrUses.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          {exampleHref ? (
            <NextLink href={exampleHref} className="rx-origin-example">
              View example Decision <span aria-hidden="true">→</span>
            </NextLink>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
