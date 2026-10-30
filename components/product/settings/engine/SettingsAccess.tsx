"use client";

import { useMemo, useState } from "react";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import {
  ACCESS_ROLE_LABELS,
  DEMO_USERS_HOTEL,
  DEMO_USERS_RESTAURANT,
  type AccessRoleId,
  type DemoSettingsState,
  type DemoUser,
} from "@/lib/radr/product/demoSettings";

type Props = {
  vertical: DemoVerticalFamily;
  demo: DemoSettingsState;
  onPatch: (partial: Partial<DemoSettingsState>) => void;
};

export function SettingsAccess({ vertical, demo, onPatch }: Props) {
  const roster = useMemo(() => {
    const base =
      vertical === "hotel" ? DEMO_USERS_HOTEL : DEMO_USERS_RESTAURANT;
    return demo.users?.length ? demo.users : base;
  }, [demo.users, vertical]);

  const [selectedId, setSelectedId] = useState(roster[0]?.id ?? "");
  const selected = roster.find((u) => u.id === selectedId) ?? roster[0];

  const updateUser = (id: string, patch: Partial<DemoUser>) => {
    const next = roster.map((u) => (u.id === id ? { ...u, ...patch } : u));
    onPatch({ users: next });
  };

  return (
    <div className="se-split" data-settings-access="true">
      <section className="se-panel">
        <header className="se-panel-head">
          <div>
            <h2>Users & Access</h2>
            <p>
              Access roles control what data and actions a signed-in user may
              use. Persona lens is separate — it only changes what RADR
              prioritizes.
            </p>
          </div>
          <button
            type="button"
            className="se-docs"
            data-testid="invite-user"
            onClick={() => {
              window.alert(
                "Invite flow is demo-only. Production invites ship with auth.",
              );
            }}
          >
            Invite user
          </button>
        </header>

        <div className="se-callout" style={{ marginTop: 0, marginBottom: 14 }}>
          <strong>Persona ≠ access</strong>
          <p>
            Demo Controls change the lens (CFO / GM / Chef). They never grant
            Admin permissions. Access role below is the real gate.
          </p>
        </div>

        <div className="se-table-wrap">
          <table className="se-table" aria-label="Users">
            <thead>
              <tr>
                <th>Name</th>
                <th>Access role</th>
                <th>Scope</th>
                <th>Status</th>
                <th>Last active</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((u) => (
                <tr
                  key={u.id}
                  data-user-row={u.id}
                  data-active={selected?.id === u.id ? "true" : undefined}
                  onClick={() => setSelectedId(u.id)}
                >
                  <td>
                    <strong>{u.name}</strong>
                    <div style={{ fontSize: 11.5, color: "#8a928d" }}>
                      {u.email}
                    </div>
                  </td>
                  <td>{ACCESS_ROLE_LABELS[u.accessRole]}</td>
                  <td>{u.scope}</td>
                  <td>
                    <span
                      className="se-pill"
                      data-tone={
                        u.status === "active"
                          ? "override"
                          : u.status === "invited"
                            ? "inherit"
                            : "inherit"
                      }
                    >
                      {u.status}
                    </span>
                  </td>
                  <td>{u.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selected ? (
        <aside className="se-panel se-detail" data-user-detail={selected.id}>
          <header className="se-panel-head">
            <div>
              <h2>{selected.name}</h2>
              <p>
                {selected.role} · {selected.email}
              </p>
            </div>
          </header>

          <div className="se-form se-form-stack">
            <div className="se-field">
              <label htmlFor="access-role">Access role</label>
              <small>RBAC — not the demo persona lens.</small>
              <select
                id="access-role"
                value={selected.accessRole}
                data-testid="access-role"
                onChange={(e) =>
                  updateUser(selected.id, {
                    accessRole: e.target.value as AccessRoleId,
                  })
                }
              >
                {(Object.keys(ACCESS_ROLE_LABELS) as AccessRoleId[]).map(
                  (id) => (
                    <option key={id} value={id}>
                      {ACCESS_ROLE_LABELS[id]}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="se-field">
              <label htmlFor="access-scope">Scope</label>
              <small>Locations and portfolios this member can reach.</small>
              <input
                id="access-scope"
                value={selected.scope}
                onChange={(e) =>
                  updateUser(selected.id, { scope: e.target.value })
                }
              />
            </div>

            <div className="se-field">
              <label>Status</label>
              <small>Invited members cannot act until accepted.</small>
              <div className="se-segment" role="group" aria-label="Status">
                {(["active", "invited", "revoked"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    data-active={selected.status === s ? "true" : undefined}
                    onClick={() => updateUser(selected.id, { status: s })}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="se-demo-foot" style={{ marginTop: 18 }}>
            <button
              type="button"
              className="se-btn-secondary"
              data-testid="revoke-access"
              onClick={() => {
                if (
                  window.confirm(
                    `Revoke access for ${selected.name}? They will become read-blocked in demo.`,
                  )
                ) {
                  updateUser(selected.id, { status: "revoked" });
                }
              }}
            >
              Revoke access
            </button>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
