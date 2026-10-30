"use client";

import { useMemo, useState } from "react";
import type { RadrDashboard } from "@/lib/product/dashboards";
import {
  availableToInvite,
  permissionLabel,
  visibilityForShares,
  type DashboardShareEntry,
  type SharePermission,
  type ShareSubjectKind,
} from "@/lib/product/dashboardSharing";

type Props = {
  dashboard: RadrDashboard;
  onClose: () => void;
  onChange: (next: {
    sharedWith: DashboardShareEntry[];
    visibility: RadrDashboard["visibility"];
  }) => void;
};

const KIND_TABS: { id: ShareSubjectKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "person", label: "People" },
  { id: "team", label: "Teams" },
  { id: "role", label: "Roles" },
];

export function DashboardShareModal({ dashboard, onClose, onChange }: Props) {
  const [kindFilter, setKindFilter] = useState<ShareSubjectKind | "all">("all");
  const [inviteId, setInviteId] = useState("");
  const [invitePerm, setInvitePerm] = useState<Exclude<SharePermission, "owner">>(
    "view",
  );

  const sharedWith = dashboard.sharedWith ?? [];
  const invitePool = useMemo(
    () => availableToInvite(sharedWith).filter((c) =>
      kindFilter === "all" ? true : c.kind === kindFilter,
    ),
    [sharedWith, kindFilter],
  );

  const commit = (nextShares: DashboardShareEntry[]) => {
    onChange({
      sharedWith: nextShares,
      visibility: visibilityForShares(nextShares),
    });
  };

  const setPermission = (id: string, permission: SharePermission) => {
    if (permission === "owner") return;
    commit(
      sharedWith.map((e) =>
        e.id === id && e.permission !== "owner"
          ? { ...e, permission }
          : e,
      ),
    );
  };

  const removeEntry = (id: string) => {
    const target = sharedWith.find((e) => e.id === id);
    if (!target || target.permission === "owner") return;
    commit(sharedWith.filter((e) => e.id !== id));
  };

  const invite = () => {
    const item = invitePool.find((c) => c.id === inviteId);
    if (!item) return;
    commit([
      ...sharedWith,
      {
        id: item.id,
        kind: item.kind,
        label: item.label,
        permission: invitePerm,
      },
    ]);
    setInviteId("");
  };

  return (
    <div
      className="rp-dbx-share"
      role="dialog"
      aria-modal="true"
      aria-label="Share dashboard"
      data-builder-share="true"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="rp-dbx-share-backdrop" onClick={onClose} />
      <div className="rp-dbx-share-panel">
        <header>
          <h3>Share “{dashboard.name}”</h3>
          <button type="button" className="rp-dbx-link" onClick={onClose}>
            ×
          </button>
        </header>

        <p>
          Invite people, teams, or roles with View or Edit access. Public
          anonymous sharing is off by default.
        </p>

        <div className="rp-dbx-share-tabs" role="tablist" aria-label="Invite type">
          {KIND_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              data-active={kindFilter === t.id ? "true" : undefined}
              aria-selected={kindFilter === t.id}
              onClick={() => setKindFilter(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="rp-dbx-share-invite">
          <select
            aria-label="Invite subject"
            data-testid="share-invite-select"
            value={inviteId}
            onChange={(e) => setInviteId(e.target.value)}
          >
            <option value="">Add person, team, or role…</option>
            {invitePool.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} · {c.hint}
              </option>
            ))}
          </select>
          <select
            aria-label="Permission"
            data-testid="share-invite-perm"
            value={invitePerm}
            onChange={(e) =>
              setInvitePerm(e.target.value as "view" | "edit")
            }
          >
            <option value="view">View</option>
            <option value="edit">Edit</option>
          </select>
          <button
            type="button"
            className="rp-dbx-primary"
            data-testid="share-invite-add"
            disabled={!inviteId}
            onClick={invite}
          >
            Invite
          </button>
        </div>

        <ul data-testid="share-list">
          {sharedWith.map((e) => (
            <li key={e.id} data-share-id={e.id} data-kind={e.kind}>
              <div>
                <strong>{e.label}</strong>
                <em>
                  {e.kind === "person"
                    ? "Person"
                    : e.kind === "team"
                      ? "Team"
                      : "Role"}
                </em>
              </div>
              {e.permission === "owner" ? (
                <span>{permissionLabel(e.permission)}</span>
              ) : (
                <div className="rp-dbx-share-row-actions">
                  <select
                    aria-label={`Permission for ${e.label}`}
                    value={e.permission}
                    onChange={(ev) =>
                      setPermission(
                        e.id,
                        ev.target.value as SharePermission,
                      )
                    }
                  >
                    <option value="view">View</option>
                    <option value="edit">Edit</option>
                  </select>
                  <button
                    type="button"
                    className="rp-dbx-link"
                    aria-label={`Remove ${e.label}`}
                    onClick={() => removeEntry(e.id)}
                  >
                    Remove
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        <p className="rp-dbx-share-foot">
          Visibility:{" "}
          <strong>{dashboard.visibility.toLowerCase()}</strong>
          {" · "}
          No public link
        </p>

        <button
          type="button"
          className="rp-dbx-primary"
          data-testid="share-done"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  );
}
