"use client";

/**
 * Decision cockpit bands — NEEDS YOU / HANDLING / WATCHING / VERIFIED.
 * Attention budget already applied to needsYou findings upstream.
 */

import type { Finding } from "@/lib/radr/domain";
import type { RoleAttention } from "@/lib/radr/roleAttention";
import { formatEuro } from "@/lib/radr/money";

type Props = {
  attention: RoleAttention;
  maxAttention: number;
  onOpenFinding?: (id: string) => void;
  /** Hide WATCHING when empty and healthy (silence). */
  hideEmptyWatch?: boolean;
};

function FindingLine({
  finding,
  onOpen,
}: {
  finding: Finding;
  onOpen?: (id: string) => void;
}) {
  const money = finding.financialImpact?.primaryValue;
  const body = (
    <>
      <strong>{finding.title}</strong>
      {money != null && money > 0 ? (
        <span>{formatEuro(money)}</span>
      ) : null}
    </>
  );
  if (!onOpen) {
    return <li className="rp-cockpit-line">{body}</li>;
  }
  return (
    <li className="rp-cockpit-line">
      <button type="button" onClick={() => onOpen(finding.id)}>
        {body}
      </button>
    </li>
  );
}

export function CockpitBands({
  attention,
  maxAttention,
  onOpenFinding,
  hideEmptyWatch = true,
}: Props) {
  const needs = attention.findings.slice(0, maxAttention);
  const handling = attention.handling.slice(0, 4);
  const watching = attention.watching.slice(0, 3);
  const showWatch = !hideEmptyWatch || watching.length > 0;

  return (
    <div className="rp-cockpit-bands" aria-label="Decision cockpit">
      <section className="rp-cockpit-band" data-band="needs">
        <header>
          <p className="rp-cockpit-band-kicker">Needs you</p>
          <p className="rp-cockpit-band-count">
            {needs.length}
            <span> / {maxAttention}</span>
          </p>
        </header>
        {needs.length === 0 ? (
          <p className="rp-cockpit-empty">{attention.headline}</p>
        ) : (
          <ul>
            {needs.map((f) => (
              <FindingLine key={f.id} finding={f} onOpen={onOpenFinding} />
            ))}
          </ul>
        )}
      </section>

      <section className="rp-cockpit-band" data-band="handling">
        <header>
          <p className="rp-cockpit-band-kicker">RADR is handling</p>
          <p className="rp-cockpit-band-count">{handling.length}</p>
        </header>
        {handling.length === 0 ? (
          <p className="rp-cockpit-empty">Nothing in flight.</p>
        ) : (
          <ul>
            {handling.map((f) => (
              <FindingLine key={f.id} finding={f} />
            ))}
          </ul>
        )}
      </section>

      {showWatch ? (
        <section className="rp-cockpit-band" data-band="watching">
          <header>
            <p className="rp-cockpit-band-kicker">Watching</p>
            <p className="rp-cockpit-band-count">{watching.length}</p>
          </header>
          {watching.length === 0 ? (
            <p className="rp-cockpit-empty">Quiet.</p>
          ) : (
            <ul>
              {watching.map((f) => (
                <FindingLine key={f.id} finding={f} />
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <section className="rp-cockpit-band" data-band="verified">
        <header>
          <p className="rp-cockpit-band-kicker">Verified</p>
          <p className="rp-cockpit-band-count">
            {attention.verifiedToday > 0
              ? formatEuro(attention.verifiedToday)
              : attention.verifiedCount}
          </p>
        </header>
        <p className="rp-cockpit-empty">
          {attention.verifiedLine ?? "No verified value yet today."}
        </p>
      </section>
    </div>
  );
}
