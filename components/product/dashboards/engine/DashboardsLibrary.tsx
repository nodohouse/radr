"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  categoryTagsFor,
  formatRelativeUpdate,
  HOTEL_ROLE_FILTERS,
  HOTEL_TEMPLATE_CATEGORIES,
  LIBRARY_TABS,
  pinnedPreviewFor,
  RESTAURANT_ROLE_FILTERS,
  TEMPLATE_CATEGORIES,
  type LibraryTemplate,
  type LibraryView,
  type TemplateCategory,
} from "@/lib/radr/product/dashboardsProofEngine";
import {
  isSystemTemplate,
  moduleTitle,
  type RadrDashboard,
} from "@/lib/product/dashboards";
import { shareMetaLabel } from "@/lib/product/dashboardSharing";
import { DashboardMiniPreview } from "./DashboardMiniPreview";
import { ManagePinnedPanel } from "./ManagePinnedPanel";

type Props = {
  isHotel?: boolean;
  view: LibraryView;
  pinned: RadrDashboard[];
  mine: RadrDashboard[];
  recent: RadrDashboard[];
  templates: LibraryTemplate[];
  templatePool: LibraryTemplate[];
  category: TemplateCategory;
  roleFilter: string;
  sort: "relevant" | "used" | "newest";
  search: string;
  pinWarning: string | null;
  manageOpen: boolean;
  onView: (v: LibraryView) => void;
  onCategory: (c: TemplateCategory) => void;
  onRoleFilter: (r: string) => void;
  onSort: (s: "relevant" | "used" | "newest") => void;
  onSearch: (q: string) => void;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUseTemplate: (id: string) => void;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onManagePinned: () => void;
  onCloseManage: () => void;
  onReorderPinned: (ids: string[]) => void;
  onDismissPinWarning: () => void;
  onManageAccess: (id: string) => void;
};

export function DashboardsLibrary({
  isHotel = false,
  view,
  pinned,
  mine,
  recent,
  templates,
  templatePool,
  category,
  roleFilter,
  sort,
  search,
  pinWarning,
  manageOpen,
  onView,
  onCategory,
  onRoleFilter,
  onSort,
  onSearch,
  onOpen,
  onDuplicate,
  onUseTemplate,
  onPin,
  onDelete,
  onCreate,
  onManagePinned,
  onCloseManage,
  onReorderPinned,
  onDismissPinWarning,
  onManageAccess,
}: Props) {
  const hero = pinned[0] ?? null;
  const secondaryPinned = pinned.slice(1);
  const pinnedIds = new Set(pinned.map((d) => d.id));
  const categories = isHotel ? HOTEL_TEMPLATE_CATEGORIES : TEMPLATE_CATEGORIES;
  const roleFilters = isHotel ? HOTEL_ROLE_FILTERS : RESTAURANT_ROLE_FILTERS;

  return (
    <div
      className="db-lib"
      data-dashboards-library="true"
      data-vertical={isHotel ? "hotel" : "restaurant"}
    >
      <header className="db-head">
        <div>
          <h1>Dashboards</h1>
          <p>
            {isHotel
              ? "Build, save and share hotel operating views."
              : "Build, save and share operating views."}
          </p>
        </div>
        <div className="db-head-actions">
          <input
            type="search"
            className="db-search"
            placeholder={
              isHotel
                ? "Search dashboards, roles or hotel metrics..."
                : "Search dashboards, roles or metrics..."
            }
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            aria-label="Search dashboards"
          />
          <select
            className="db-select"
            value={roleFilter}
            onChange={(e) => onRoleFilter(e.target.value)}
            aria-label="Filter by role"
          >
            {roleFilters.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="db-btn-primary"
            data-testid="create-dashboard"
            onClick={onCreate}
          >
            + Create dashboard
          </button>
        </div>
      </header>

      {pinWarning ? (
        <div className="db-pin-warn" role="status" data-pin-warn="true">
          <span>{pinWarning}</span>
          <button type="button" className="db-link" onClick={onDismissPinWarning}>
            Dismiss
          </button>
        </div>
      ) : null}

      <nav className="db-tabs" aria-label="Dashboard library">
        {LIBRARY_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            data-active={view === t.id ? "true" : undefined}
            data-db-tab={t.id}
            onClick={() => onView(t.id)}
          >
            {t.id === "pinned" ? <StarIcon /> : null}
            {t.id === "mine" ? <UserIcon /> : null}
            {t.id === "templates" ? <GridIcon /> : null}
            {t.id === "recent" ? <ClockIcon /> : null}
            {t.label}
          </button>
        ))}
      </nav>

      {(view === "pinned" || view === "templates") && hero ? (
        <section className="db-pinned" aria-label="Pinned dashboards">
          <div className="db-section-head">
            <div>
              <h2>Pinned</h2>
              <p>Your most important operating views, right at hand.</p>
            </div>
            <button
              type="button"
              className="db-btn-ghost"
              data-manage-pinned-btn="true"
              onClick={onManagePinned}
            >
              Manage pinned
            </button>
          </div>

          <article className="db-pinned-hero" data-pinned-hero="true">
            <div className="db-pinned-meta">
              <span className="db-pin-badge">
                <StarIcon /> Pinned
              </span>
              <h3>{hero.name}</h3>
              <p>
                {hero.description ||
                  "Live pace, contribution, Decisions, and team performance."}
              </p>
              <div className="db-tags">
                {categoryTagsFor(hero, isHotel).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="db-meta-row">
                <span>{hero.widgets.length} widgets</span>
                <button
                  type="button"
                  className="db-meta-link"
                  data-manage-access={hero.id}
                  onClick={() => onManageAccess(hero.id)}
                >
                  {shareMetaLabel(hero)}
                </button>
                <span>{formatRelativeUpdate(hero.updatedAt)}</span>
              </div>
            </div>
            <div className="db-pinned-preview">
              <DashboardMiniPreview
                kind={pinnedPreviewFor(hero)}
                size="hero"
              />
            </div>
            <div className="db-pinned-actions">
              <button
                type="button"
                className="db-btn-primary"
                data-open-dashboard={hero.id}
                onClick={() => onOpen(hero.id)}
              >
                Open dashboard →
              </button>
              <Link
                href={`/app/dashboards/${hero.id}/edit`}
                className="db-btn-secondary"
              >
                Customize
              </Link>
              <CardMenu
                items={[
                  {
                    label: "Manage access",
                    onClick: () => onManageAccess(hero.id),
                  },
                  {
                    label: "Unpin",
                    onClick: () => onPin(hero.id),
                  },
                  {
                    label: "Duplicate",
                    onClick: () => onDuplicate(hero.id),
                  },
                  ...(isSystemTemplate(hero.id)
                    ? []
                    : [
                        {
                          label: "Delete",
                          danger: true,
                          onClick: () => onDelete(hero.id),
                        },
                      ]),
                ]}
              />
            </div>
          </article>

          {secondaryPinned.length > 0 ? (
            <div className="db-pinned-row">
              {secondaryPinned.map((d) => (
                <article key={d.id} className="db-pinned-card">
                  <DashboardMiniPreview
                    kind={pinnedPreviewFor(d)}
                    size="card"
                  />
                  <div>
                    <span className="db-role">
                      {d.roleTemplate?.toUpperCase() || "VIEW"}
                    </span>
                    <h4>{d.name}</h4>
                    <p>{d.description}</p>
                    <div className="db-meta-row">
                      <span className="db-pin-badge">★ Pinned</span>
                      <span>{formatRelativeUpdate(d.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="db-pinned-card-actions">
                    <button
                      type="button"
                      className="db-btn-primary"
                      onClick={() => onOpen(d.id)}
                    >
                      Open →
                    </button>
                    <CardMenu
                      items={[
                        { label: "Unpin", onClick: () => onPin(d.id) },
                        {
                          label: "Duplicate",
                          onClick: () => onDuplicate(d.id),
                        },
                        {
                          label: "Customize",
                          href: `/app/dashboards/${d.id}/edit`,
                        },
                      ]}
                    />
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {view === "pinned" && !hero ? (
        <section className="db-empty">
          <h2>
            {isHotel
              ? "No Hotel dashboards pinned yet"
              : "No pinned dashboards yet"}
          </h2>
          <p>
            {isHotel
              ? "Pin a Hotel template for quick access in navigation."
              : "Pin a template or dashboard for quick access in navigation."}
          </p>
          <button
            type="button"
            className="db-btn-primary"
            onClick={() => onView("templates")}
          >
            {isHotel ? "Browse Hotel templates" : "Browse templates"}
          </button>
        </section>
      ) : null}

      {view === "mine" ? (
        <section className="db-mine" aria-label="My dashboards">
          <div className="db-section-head">
            <div>
              <h2>My dashboards</h2>
              <p>Views you own or customized.</p>
            </div>
          </div>
          {mine.length === 0 ? (
            <div className="db-empty">
              <h2>
                {isHotel
                  ? "No Hotel dashboards yet"
                  : "Create your first operating view"}
              </h2>
              <p>
                {isHotel
                  ? "Ask RADR, use a Hotel template, or start blank."
                  : "Start blank, use a template, or ask RADR."}
              </p>
              <button
                type="button"
                className="db-btn-primary"
                onClick={onCreate}
              >
                + Create dashboard
              </button>
            </div>
          ) : (
            <div className="db-tpl-grid">
              {mine.map((d) => (
                <article
                  key={d.id}
                  className="db-tpl-card"
                  data-mine-card={d.id}
                >
                  <div className="db-tpl-top">
                    <DashboardMiniPreview
                      kind={pinnedPreviewFor(d)}
                      size="thumb"
                    />
                    <CardMenu
                      items={[
                        {
                          label: pinnedIds.has(d.id) ? "Unpin" : "Pin to nav",
                          onClick: () => onPin(d.id),
                        },
                        {
                          label: "Duplicate",
                          onClick: () => onDuplicate(d.id),
                        },
                        {
                          label: "Customize",
                          href: `/app/dashboards/${d.id}/edit`,
                        },
                        {
                          label: "Delete",
                          danger: true,
                          onClick: () => onDelete(d.id),
                        },
                      ]}
                    />
                  </div>
                  <div className="db-tpl-body">
                    <h3>{d.name}</h3>
                    <p>{d.description || `${d.widgets.length} widgets`}</p>
                    <ul>
                      {d.widgets.slice(0, 4).map((w) => (
                        <li key={w.id}>
                          {moduleTitle(w.intelligenceModuleId)}
                        </li>
                      ))}
                    </ul>
                    <div className="db-tpl-actions">
                      <button
                        type="button"
                        className="db-btn-primary"
                        onClick={() => onOpen(d.id)}
                      >
                        Open dashboard →
                      </button>
                      <button
                        type="button"
                        className="db-btn-secondary"
                        data-pin={d.id}
                        onClick={() => onPin(d.id)}
                      >
                        {pinnedIds.has(d.id) ? "★ Pinned" : "Pin to nav"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {view === "recent" ? (
        <section className="db-recent" aria-label="Recently used">
          <div className="db-section-head">
            <div>
              <h2>Recently used</h2>
              <p>Pick up where you left off.</p>
            </div>
          </div>
          {recent.length === 0 ? (
            <div className="db-empty">
              <p>Open a dashboard to build your recent list.</p>
            </div>
          ) : (
            <ul className="db-recent-list">
              {recent.map((d) => (
                <li key={d.id}>
                  <button type="button" onClick={() => onOpen(d.id)}>
                    <strong>{d.name}</strong>
                    <span>{formatRelativeUpdate(d.updatedAt)}</span>
                    <span>{d.widgets.length} widgets</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {view === "templates" || view === "pinned" ? (
        <section className="db-templates" aria-label="Templates">
          <div className="db-section-head">
            <div>
              <h2>Templates</h2>
              <p>
                Start with a proven template and tailor it to your operation.
              </p>
            </div>
            <div className="db-tpl-tools">
              <select
                className="db-select"
                value={sort}
                onChange={(e) =>
                  onSort(e.target.value as "relevant" | "used" | "newest")
                }
                aria-label="Sort templates"
              >
                <option value="relevant">Most relevant</option>
                <option value="used">Most used</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          <div
            className="db-cat-pills"
            role="tablist"
            aria-label="Template categories"
          >
            {categories.map((c) => {
              const count =
                c.id === "all"
                  ? templatePool.length
                  : templatePool.filter((t) => t.category === c.id).length;
              if (c.id !== "all" && count === 0) return null;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  data-active={category === c.id ? "true" : undefined}
                  onClick={() => onCategory(c.id)}
                >
                  {c.label}
                  {c.id === "all"
                    ? ` (${templatePool.length})`
                    : count
                      ? ` (${count})`
                      : ""}
                </button>
              );
            })}
          </div>

          <div className="db-tpl-grid">
            {templates.map((t) => (
              <article
                key={t.id}
                className="db-tpl-card"
                data-template-card={t.id}
              >
                <div className="db-tpl-top">
                  <DashboardMiniPreview kind={t.preview} size="thumb" />
                  <div className="db-tpl-badges">
                    <span className="db-role">{t.roleLabel}</span>
                    {t.badge ? (
                      <span className="db-badge" data-badge={t.badge}>
                        {t.badge === "most-used"
                          ? "Most used"
                          : t.badge === "recommended"
                            ? "Recommended"
                            : "Popular"}
                      </span>
                    ) : null}
                    <CardMenu
                      items={[
                        {
                          label: pinnedIds.has(t.id)
                            ? "Unpin"
                            : "Pin to nav",
                          onClick: () => onPin(t.id),
                        },
                        {
                          label: "Use template",
                          onClick: () => onUseTemplate(t.id),
                        },
                        {
                          label: "Duplicate",
                          onClick: () => onDuplicate(t.id),
                        },
                      ]}
                    />
                  </div>
                </div>
                <div className="db-tpl-body">
                  <h3>{t.name}</h3>
                  <p>{t.description}</p>
                  <ul>
                    {t.widgetLabels.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                  <div className="db-meta-row">
                    <span>{t.widgetLabels.length}+ widgets</span>
                    <span>{t.updatedLabel}</span>
                  </div>
                  <div className="db-tpl-actions">
                    <button
                      type="button"
                      className="db-btn-primary"
                      data-open-template={t.id}
                      onClick={() => onOpen(t.id)}
                    >
                      Open template →
                    </button>
                    <button
                      type="button"
                      className="db-btn-secondary"
                      data-duplicate={t.id}
                      onClick={() => onUseTemplate(t.id)}
                    >
                      Duplicate
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {manageOpen ? (
        <ManagePinnedPanel
          pinned={pinned}
          onClose={onCloseManage}
          onReorder={onReorderPinned}
          onUnpin={onPin}
          onOpen={onOpen}
        />
      ) : null}
    </div>
  );
}

type MenuItem = {
  label: string;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
};

function CardMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="db-menu" ref={ref}>
      <button
        type="button"
        className="db-menu-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label="More actions"
        onClick={() => setOpen((v) => !v)}
      >
        ···
      </button>
      {open ? (
        <div id={menuId} className="db-menu-pop" role="menu">
          {items.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                role="menuitem"
                className="db-menu-item"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className="db-menu-item"
                data-danger={item.danger ? "true" : undefined}
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3.5 14.6 9l6 .5-4.6 3.9 1.4 5.8L12 16.5 6.6 19.2 8 13.4 3.4 9.5l6-.5L12 3.5Z" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c1.5-3 4-4.5 7-4.5S17.5 16 19 19" strokeLinecap="round" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" strokeLinecap="round" />
    </svg>
  );
}
