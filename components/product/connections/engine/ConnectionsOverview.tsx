"use client";

import Link from "next/link";
import { useState } from "react";
import { VendorLogo } from "@/components/product/connections/VendorLogo";
import type { CatalogEntry } from "@/components/product/connections/VendorLogo";
import {
  dependentDecisionsFor,
  filterCatalog,
  filterConnectionRows,
  type ConnectionRow,
  type ConnectionsCategoryFilter,
  type ConnectionsOverviewModel,
  type ConnectionsStatusFilter,
} from "@/lib/radr/product/connectionsProofEngine";

type Props = {
  model: ConnectionsOverviewModel;
  category: ConnectionsCategoryFilter;
  onCategory: (c: ConnectionsCategoryFilter) => void;
  status: ConnectionsStatusFilter;
  onStatus: (s: ConnectionsStatusFilter) => void;
  query: string;
  onQuery: (q: string) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  showAllCatalog: boolean;
  onShowAllCatalog: (v: boolean) => void;
  onCatalogAction: (entry: CatalogEntry) => void;
  requestedIds: Set<string>;
};

function StatusDot({ status }: { status: ConnectionRow["status"] }) {
  const label =
    status === "CONNECTED"
      ? "Connected"
      : status === "DEGRADED"
        ? "Degraded"
        : status === "STALE"
          ? "Stale"
          : status;
  return (
    <span className="ce-status" data-status={status.toLowerCase()}>
      <i />
      {label}
    </span>
  );
}

function UnlocksCell({ unlocks }: { unlocks: string[] }) {
  const [open, setOpen] = useState(false);
  const preview = 3;
  const hasMore = unlocks.length > preview;
  const visible = open ? unlocks : unlocks.slice(0, preview);
  return (
    <div>
      <ul className="ce-chips">
        {visible.map((u) => (
          <li key={u}>{u}</li>
        ))}
      </ul>
      {hasMore ? (
        <button
          type="button"
          className="ce-chip-more"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
        >
          {open ? "Show less" : `+${unlocks.length - preview} more`}
        </button>
      ) : null}
    </div>
  );
}

function CoverageDonut({
  percent,
  parts,
  active,
  onSelect,
}: {
  percent: number;
  parts: ConnectionsOverviewModel["coverageByCategory"];
  active: ConnectionsCategoryFilter;
  onSelect: (c: ConnectionsCategoryFilter) => void;
}) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const sum = parts.reduce((s, p) => s + Math.max(p.percent, 1), 0);
  let acc = 0;
  return (
    <div className="ce-donut-wrap">
      <div className="ce-donut-shell">
        <svg viewBox="0 0 100 100" className="ce-donut" aria-hidden>
          <circle cx="50" cy="50" r={r} fill="none" stroke="#eef0ef" strokeWidth="11" />
          {parts.map((p) => {
            const weight = Math.max(p.percent, 1);
            const len = (weight / sum) * c * 0.92;
            const dash = `${len} ${c - len}`;
            const rot = (acc / sum) * 360 - 90;
            acc += weight;
            return (
              <circle
                key={p.id}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={p.color}
                strokeWidth="11"
                strokeDasharray={dash}
                transform={`rotate(${rot} 50 50)`}
                opacity={active !== "All" && active !== p.id ? 0.35 : 1}
              />
            );
          })}
        </svg>
        <div className="ce-donut-center">
          <strong>{percent}%</strong>
          <span>Coverage</span>
        </div>
      </div>
      <ul className="ce-cov-legend">
        {parts.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              data-active={active === p.id ? "true" : undefined}
              onClick={() => onSelect(active === p.id ? "All" : p.id)}
            >
              <i style={{ background: p.color }} />
              {p.label}
              <em>{p.percent}%</em>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConnectionRowBlock({
  row: r,
  deps,
  selected,
  menuOpen,
  onSelect,
  onMenu,
  onCloseMenu,
}: {
  row: ConnectionRow;
  deps: { id: string; label: string }[];
  selected: boolean;
  menuOpen: boolean;
  onSelect: (id: string | null) => void;
  onMenu: () => void;
  onCloseMenu: () => void;
}) {
  return (
    <>
      <tr
        data-status={r.status.toLowerCase()}
        data-active={selected ? "true" : undefined}
        onClick={() => onSelect(selected ? null : r.id)}
      >
        <td>
          <div className="ce-sys">
            <VendorLogo id={r.id} name={r.name} size={40} />
            <div>
              <strong>{r.name}</strong>
              <span>{r.domain}</span>
            </div>
          </div>
        </td>
        <td>
          <StatusDot status={r.status} />
        </td>
        <td>
          <span
            className="ce-fresh"
            title={`Last successful: ${r.lastSuccessAt} · Expected cadence: ${r.expectedCadence}`}
          >
            {r.freshness}
          </span>
        </td>
        <td>
          <div className="ce-cov">
            <strong>{r.coverageLabel}</strong>
            <em>{r.coverageDetail}</em>
          </div>
        </td>
        <td>
          <UnlocksCell unlocks={r.unlocks} />
        </td>
        <td>
          <div className="ce-deps">
            {deps.length ? (
              deps.map((d) => (
                <Link
                  key={d.id}
                  href={`/app/decisions/${d.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {d.label}
                </Link>
              ))
            ) : (
              <em>—</em>
            )}
          </div>
        </td>
        <td className="ce-actions">
          <button
            type="button"
            aria-label={`Actions for ${r.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onMenu();
            }}
          >
            ···
          </button>
          {menuOpen ? (
            <div className="ce-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(r.id);
                  onCloseMenu();
                }}
              >
                Open detail
              </button>
              <Link
                href={`/app/data-health?source=${r.id}`}
                role="menuitem"
                onClick={(e) => e.stopPropagation()}
              >
                View Data Health
              </Link>
              {deps[0] ? (
                <Link
                  href={`/app/decisions/${deps[0].id}`}
                  role="menuitem"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open Decision
                </Link>
              ) : null}
            </div>
          ) : null}
        </td>
      </tr>
      {r.impactDetail ? (
        <tr
          data-status={r.status.toLowerCase()}
          className="ce-impact-row"
          onClick={() => onSelect(selected ? null : r.id)}
        >
          <td colSpan={7}>
            <p className="ce-impact">
              <span>⚠ {r.impactDetail}</span>
              <Link
                href={`/app/data-health?source=${r.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                View Data Health →
              </Link>
            </p>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function CatalogCard({
  entry,
  requested,
  onAction,
}: {
  entry: CatalogEntry;
  requested: boolean;
  onAction: () => void;
}) {
  const kind = entry.status === "AVAILABLE" ? "setup" : "secondary";
  const label =
    entry.status === "AVAILABLE"
      ? "Set up →"
      : entry.status === "REQUEST_ACCESS"
        ? "Request access →"
        : entry.status === "PLANNED"
          ? "Notify me"
          : "Configure";
  const badge =
    entry.status === "AVAILABLE"
      ? "Available"
      : entry.status === "REQUEST_ACCESS"
        ? "Request access"
        : entry.status === "PLANNED"
          ? "Planned"
          : "Custom";

  return (
    <li className="ce-card" data-conn-id={entry.id}>
      <div className="ce-card-head">
        <VendorLogo id={entry.id} name={entry.name} size={40} />
        <div>
          <strong>{entry.name}</strong>
          <span>{entry.category}</span>
        </div>
        <span className="ce-badge" data-status={entry.status.toLowerCase()}>
          {badge}
        </span>
      </div>
      <dl>
        <div>
          <dt>Data</dt>
          <dd>{entry.data}</dd>
        </div>
        <div>
          <dt>RADR unlocks</dt>
          <dd>{entry.unlocks}</dd>
        </div>
      </dl>
      <button
        type="button"
        className="ce-card-cta"
        data-kind={kind}
        disabled={requested}
        onClick={onAction}
      >
        {requested
          ? entry.status === "PLANNED"
            ? "We’ll tell you"
            : "Requested"
          : label}
      </button>
    </li>
  );
}

export function ConnectionsOverview({
  model,
  category,
  onCategory,
  status,
  onStatus,
  query,
  onQuery,
  selectedId,
  onSelect,
  showAllCatalog,
  onShowAllCatalog,
  onCatalogAction,
  requestedIds,
}: Props) {
  const [menuId, setMenuId] = useState<string | null>(null);

  const rows = filterConnectionRows(model.rows, query, category, status);
  const catalogSource = showAllCatalog ? model.catalogAll : model.recommended;
  const catalog = filterCatalog(catalogSource, query, category, status);

  const toggleStatus = (next: ConnectionsStatusFilter) =>
    onStatus(status === next ? "all" : next);

  return (
    <div className="ce-overview" data-connections-view="overview">
      <div className="ce-summary" role="group" aria-label="Connection summary">
        <button
          type="button"
          data-active={status === "connected" ? "true" : undefined}
          onClick={() => toggleStatus("connected")}
        >
          <span className="ce-sum-ico" data-tone="ok" aria-hidden>
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
              <path
                d="M7.5 4.5v2.2M12.5 4.5v2.2M5.5 8.2h9c.8 0 1.5.7 1.5 1.5v5.3c0 .8-.7 1.5-1.5 1.5h-9c-.8 0-1.5-.7-1.5-1.5V9.7c0-.8.7-1.5 1.5-1.5Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.2 12.2h3.6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div>
            <strong>{model.connectedCount}</strong>
            <span>Connected</span>
          </div>
        </button>
        <button
          type="button"
          data-active={status === "attention" ? "true" : undefined}
          onClick={() => toggleStatus("attention")}
        >
          <span className="ce-sum-ico" data-tone="alert" aria-hidden>
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
              <path
                d="M10 3.8 17 16.2H3L10 3.8Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M10 8.4v3.4M10 13.8h.01"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div>
            <strong>{model.attentionCount}</strong>
            <span>Need attention</span>
          </div>
        </button>
        <button
          type="button"
          data-active={status === "available" ? "true" : undefined}
          onClick={() => toggleStatus("available")}
        >
          <span className="ce-sum-ico" data-tone="quiet" aria-hidden>
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
              <rect
                x="3.5"
                y="4"
                width="13"
                height="3.2"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <rect
                x="3.5"
                y="8.4"
                width="13"
                height="3.2"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <rect
                x="3.5"
                y="12.8"
                width="13"
                height="3.2"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>
          </span>
          <div>
            <strong>{model.availableCount}</strong>
            <span>Available</span>
          </div>
        </button>
        <button
          type="button"
          title={model.coverageTooltip}
          aria-label={`Coverage ${model.coveragePercent} percent. ${model.coverageTooltip}`}
          onClick={() => onCategory("All")}
        >
          <span className="ce-sum-ico" data-tone="cov" aria-hidden>
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
              <path
                d="M4 14.5V9.2M8.5 14.5V5.5M13 14.5v-3.8M16.5 14.5V7.8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div>
            <strong>{model.coveragePercent}%</strong>
            <span>Coverage</span>
            <em>across connected systems</em>
          </div>
        </button>
      </div>

      <div className="ce-body">
        <div className="ce-main">
          <div className="ce-tools">
            <input
              type="search"
              className="ce-search"
              placeholder="Search systems, data, or what RADR unlocks…"
              aria-label="Search connections"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
            />
            <div className="ce-cats" role="group" aria-label="Category">
              {model.categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  data-active={category === c ? "true" : undefined}
                  onClick={() => onCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {rows.length > 0 ? (
            <section className="ce-table-card" aria-label="System health and coverage">
              <h2 className="ce-table-title">System health & coverage</h2>
              <div className="ce-table-wrap">
                <table className="ce-table">
                  <thead>
                    <tr>
                      <th>System</th>
                      <th>Status</th>
                      <th>Freshness</th>
                      <th>Coverage</th>
                      <th>Data unlocked</th>
                      <th>Decision dependency</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const deps = dependentDecisionsFor(r.id);
                      return (
                        <ConnectionRowBlock
                          key={r.id}
                          row={r}
                          deps={deps}
                          selected={selectedId === r.id}
                          menuOpen={menuId === r.id}
                          onSelect={onSelect}
                          onMenu={() =>
                            setMenuId(menuId === r.id ? null : r.id)
                          }
                          onCloseMenu={() => setMenuId(null)}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ) : status !== "available" ? (
            <p className="ce-empty">
              No systems match. Try another category or clear the search.
            </p>
          ) : null}
        </div>

        <aside className="ce-rail" aria-label="Connections intelligence">
          <div className="ce-rail-card">
            <h2>RADR sees</h2>
            <p>
              <strong>{model.radrSees}</strong>
            </p>
            <p className="ce-rail-detail">{model.radrSeesDetail}</p>
          </div>

          <div className="ce-rail-card">
            <h2>Coverage by category</h2>
            <CoverageDonut
              percent={model.coveragePercent}
              parts={model.coverageByCategory}
              active={category}
              onSelect={onCategory}
            />
          </div>

          <div className="ce-rail-card">
            <h2>What RADR unlocks</h2>
            <ul className="ce-unlock-list">
              {model.unlocks.map((u) => (
                <li key={u.id} data-off={u.available ? undefined : "true"}>
                  <strong>{u.title}</strong>
                  <span>{u.detail}</span>
                  {!u.available && u.cta ? (
                    <button
                      type="button"
                      onClick={() => {
                        onCategory(
                          u.id === "workforce" ? "Workforce" : "Inventory",
                        );
                        onStatus("available");
                      }}
                    >
                      {u.cta} →
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          {model.attention.length > 0 ? (
            <div className="ce-rail-card">
              <h2>Need attention</h2>
              <ul className="ce-att-list">
                {model.attention.map((a) => (
                  <li key={a.id}>
                    <button type="button" onClick={() => onSelect(a.id)}>
                      <strong>
                        {a.name}
                        <em data-status={a.status.toLowerCase()}>
                          {a.status}
                        </em>
                      </strong>
                      <span>
                        {a.freshness} · {a.impact ?? "Needs review"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>

      {model.gaps.length > 0 ? (
        <section className="ce-gaps" aria-labelledby="ce-gaps-h">
          <div className="ce-catalog-head">
            <h2 id="ce-gaps-h">Coverage gaps</h2>
          </div>
          <ul className="ce-gaps-list">
            {model.gaps.map((g) => (
              <li key={g.id}>
                <div>
                  <strong>{g.title}</strong>
                  <p>{g.body}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onCategory(g.category);
                    if (g.category !== "Accounting") onStatus("available");
                    else onStatus("attention");
                  }}
                >
                  {g.category === "Accounting"
                    ? "Review accounting →"
                    : `View ${g.category.toLowerCase()} integrations →`}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {catalog.length > 0 || showAllCatalog ? (
        <section className="ce-catalog" aria-labelledby="ce-catalog-h">
          <div className="ce-catalog-head">
            <h2 id="ce-catalog-h">Available integrations</h2>
            <button
              type="button"
              onClick={() => onShowAllCatalog(!showAllCatalog)}
            >
              {showAllCatalog
                ? "Show recommended →"
                : "View all integrations →"}
            </button>
          </div>
          {catalog.length ? (
            <ul className="ce-catalog-grid">
              {catalog.map((c) => (
                <CatalogCard
                  key={c.id}
                  entry={c}
                  requested={requestedIds.has(c.id)}
                  onAction={() => onCatalogAction(c)}
                />
              ))}
            </ul>
          ) : (
            <p className="ce-empty">No integrations match this filter.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
