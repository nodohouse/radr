"use client";

/**
 * Connect what already runs your operation — visual architecture + honest statuses.
 * Providers from Developer catalog only.
 */

import { useState } from "react";
import NextLink from "next/link";
import {
  CONNECTION_METHODS,
  HOME_CONNECTION_GROUPS,
  SYSTEM_LAYERS,
  providerById,
  statusLabel,
} from "@/lib/marketing/homeConnections";

export function ConnectionOriginSection() {
  const [groupId, setGroupId] = useState(HOME_CONNECTION_GROUPS[0]!.id);
  const group =
    HOME_CONNECTION_GROUPS.find((g) => g.id === groupId) ??
    HOME_CONNECTION_GROUPS[0]!;

  return (
    <div className="rx-conn-origin">
      <p className="rx-rec-k">Data origin</p>
      <h2 className="rx-rec-h">Connect what already runs your operation.</h2>
      <p className="rx-rec-p rx-rec-muted">
        Systems record. RADR decides. You do not replace the stack to start.
      </p>

      <div className="rx-conn-arch" aria-label="Connection architecture">
        <div className="rx-conn-arch-col">
          <em>Your systems</em>
          <ul>
            {SYSTEM_LAYERS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="rx-conn-arch-flow" aria-hidden="true">
          ↓
        </div>
        <div className="rx-conn-arch-core">
          <strong>RADR Operating Model</strong>
          <div className="rx-conn-arch-out">
            <span>Decisions</span>
            <span>Futures</span>
            <span>Actions</span>
            <span data-tone="verified">Verified Value</span>
            <span>Memory</span>
          </div>
        </div>
      </div>

      <div className="rx-conn-methods" aria-label="Connection methods">
        {CONNECTION_METHODS.map((m) => (
          <div key={m.id}>
            <strong>{m.label}</strong>
            <span>{m.note}</span>
          </div>
        ))}
      </div>

      <nav className="rx-conn-groups" aria-label="Environment">
        {HOME_CONNECTION_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            data-on={g.id === groupId ? "true" : undefined}
            onClick={() => setGroupId(g.id)}
          >
            {g.label}
          </button>
        ))}
      </nav>

      <ul className="rx-conn-providers">
        {group.providerIds.map((id) => {
          const p = providerById(id);
          if (!p) return null;
          return (
            <li key={p.id}>
              <strong>{p.name}</strong>
              <em data-status={p.status}>{statusLabel(p)}</em>
            </li>
          );
        })}
      </ul>

      <p className="rx-pilot-note">
        Status labels match the Developer catalog. Partner access is not a live
        production claim.
      </p>

      <NextLink href="/developers#integrations" className="rx-btn rx-btn-ghost">
        Explore integrations <span aria-hidden="true">→</span>
      </NextLink>
    </div>
  );
}
