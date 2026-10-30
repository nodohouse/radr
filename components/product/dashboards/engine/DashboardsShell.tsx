"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import {
  deleteDashboard,
  duplicateDashboard,
  getDashboard,
  MAX_PINNED,
  pinnedDashboards,
  readDashboards,
  readRecentDashboardIds,
  recordDashboardOpen,
  reorderPinned,
  saveDashboard,
  togglePinDashboard,
  applyDashboardTemplate,
  type RadrDashboard,
} from "@/lib/product/dashboards";
import {
  filterLibraryTemplates,
  HOTEL_SYSTEM_IDS,
  libraryTemplates,
  parseLibraryView,
  parseTemplateCategory,
  type LibraryView,
  type TemplateCategory,
} from "@/lib/radr/product/dashboardsProofEngine";
import { DashboardShareModal } from "@/components/product/dashboards/DashboardShareModal";
import { DashboardsLibrary } from "./DashboardsLibrary";
import "./dashboards-engine.css";
import "@/components/product/dashboards/dashboard-builder.css";

const RESTAURANT_IDS = new Set([
  "dash_gm",
  "dash_coo",
  "dash_cfo",
  "dash_friday_dinner",
  "dash_restaurant_live",
  "dash_head_chef",
]);

const HOTEL_IDS = HOTEL_SYSTEM_IDS;

function filterVertical(list: RadrDashboard[], isHotel: boolean): RadrDashboard[] {
  return list.filter((d) => {
    const id = d.id;
    const role = (d.roleTemplate ?? "").toLowerCase();
    const isHotelDash =
      HOTEL_IDS.has(id) ||
      id.startsWith("dash_hotel_") ||
      role.startsWith("hotel") ||
      role.includes("housekeep") ||
      role === "front_office" ||
      role === "revenue_manager";
    const isRestaurantDash =
      RESTAURANT_IDS.has(id) ||
      (!isHotelDash && ["gm", "coo", "cfo", "chef"].includes(role));
    if (isHotel) {
      if (isHotelDash) return true;
      if (isRestaurantDash) return false;
      return !RESTAURANT_IDS.has(id);
    }
    if (isRestaurantDash || RESTAURANT_IDS.has(id)) return true;
    if (isHotelDash) return false;
    return true;
  });
}

export function DashboardsShell() {
  const router = useRouter();
  const pathname = usePathname() || "/app/dashboards";
  const searchParams = useSearchParams();
  const { isHotel } = useDemoOrg();

  const [list, setList] = useState<RadrDashboard[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [sort, setSort] = useState<"relevant" | "used" | "newest">("relevant");
  const [roleFilter, setRoleFilter] = useState("all");
  const [manageOpen, setManageOpen] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [pinWarning, setPinWarning] = useState<string | null>(null);
  const [recentTick, setRecentTick] = useState(0);

  const view = parseLibraryView(searchParams.get("view"));
  const category = parseTemplateCategory(searchParams.get("category"));

  const refresh = useCallback(() => {
    setList(readDashboards());
    setRecentTick((n) => n + 1);
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("radr-dashboards-changed", onChange);
    return () => window.removeEventListener("radr-dashboards-changed", onChange);
  }, [refresh]);

  const verticalList = useMemo(
    () => filterVertical(list, isHotel),
    [list, isHotel],
  );
  const pinned = useMemo(
    () => pinnedDashboards(verticalList),
    [verticalList],
  );
  const mine = useMemo(
    () =>
      verticalList.filter(
        (d) => !RESTAURANT_IDS.has(d.id) && !HOTEL_IDS.has(d.id),
      ),
    [verticalList],
  );
  const recent = useMemo(() => {
    void recentTick;
    const ids = readRecentDashboardIds();
    const byId = new Map(verticalList.map((d) => [d.id, d]));
    const ordered = ids
      .map((id) => byId.get(id))
      .filter((d): d is RadrDashboard => Boolean(d));
    if (ordered.length) return ordered.slice(0, 8);
    return [...verticalList]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 8);
  }, [verticalList, recentTick]);

  const allTemplates = useMemo(
    () => libraryTemplates(isHotel),
    [isHotel],
  );
  const templates = useMemo(
    () =>
      filterLibraryTemplates(
        allTemplates,
        search,
        category,
        roleFilter,
        sort,
      ),
    [allTemplates, search, category, roleFilter, sort],
  );

  const pushState = useCallback(
    (patch: {
      view?: LibraryView;
      category?: TemplateCategory;
      search?: string;
    }) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (patch.view !== undefined) {
        if (patch.view === "pinned") sp.delete("view");
        else sp.set("view", patch.view);
      }
      if (patch.category !== undefined) {
        if (patch.category === "all") sp.delete("category");
        else sp.set("category", patch.category);
      }
      if (patch.search !== undefined) {
        if (!patch.search.trim()) sp.delete("search");
        else sp.set("search", patch.search.trim());
      }
      const qs = sp.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const openDashboard = useCallback(
    (id: string) => {
      recordDashboardOpen(id);
      router.push(`/app/dashboards/${id}`);
    },
    [router],
  );

  const handlePin = useCallback(
    (id: string) => {
      const result = togglePinDashboard(id);
      refresh();
      if (result.blocked) {
        setPinWarning(
          `Too many pinned views reduces navigation clarity. Unpin one before adding another (max ${MAX_PINNED}).`,
        );
        return;
      }
      if (result.pinned && result.pinnedCount >= 5) {
        setPinWarning(
          "Too many pinned views reduces navigation clarity.",
        );
      } else if (!result.blocked) {
        setPinWarning(null);
      }
    },
    [refresh],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const dash = list.find((d) => d.id === id);
      if (!dash) return;
      if (
        !window.confirm(
          `Delete “${dash.name}”?\n\nThis cannot be undone.`,
        )
      ) {
        return;
      }
      const ok = deleteDashboard(id);
      if (!ok) {
        setPinWarning("System templates cannot be deleted.");
        return;
      }
      refresh();
    },
    [list, refresh],
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      const d = duplicateDashboard(id);
      if (d) {
        refresh();
        router.push(`/app/dashboards/${d.id}/edit`);
      }
    },
    [refresh, router],
  );

  const handleUseTemplate = useCallback(
    (id: string) => {
      const d = applyDashboardTemplate(id);
      if (d) {
        refresh();
        router.push(`/app/dashboards/${d.id}/edit`);
      }
    },
    [refresh, router],
  );

  const shareDash = shareId
    ? list.find((d) => d.id === shareId) ?? getDashboard(shareId)
    : null;

  return (
    <div className="db-root" data-dashboards-engine="true">
      <DashboardsLibrary
        isHotel={isHotel}
        view={view}
        pinned={pinned}
        mine={mine}
        recent={recent}
        templates={templates}
        templatePool={allTemplates}
        category={category}
        roleFilter={roleFilter}
        sort={sort}
        search={search}
        pinWarning={pinWarning}
        manageOpen={manageOpen}
        onView={(v) => pushState({ view: v })}
        onCategory={(c) => pushState({ category: c })}
        onRoleFilter={setRoleFilter}
        onSort={setSort}
        onSearch={(q) => {
          setSearch(q);
          pushState({ search: q });
        }}
        onOpen={openDashboard}
        onDuplicate={handleDuplicate}
        onUseTemplate={handleUseTemplate}
        onPin={handlePin}
        onDelete={handleDelete}
        onCreate={() => router.push("/app/dashboards/new")}
        onManagePinned={() => setManageOpen(true)}
        onCloseManage={() => setManageOpen(false)}
        onReorderPinned={(ids) => {
          reorderPinned(ids);
          refresh();
        }}
        onDismissPinWarning={() => setPinWarning(null)}
        onManageAccess={(id) => setShareId(id)}
      />
      {shareDash ? (
        <DashboardShareModal
          dashboard={shareDash}
          onClose={() => setShareId(null)}
          onChange={({ sharedWith, visibility }) => {
            saveDashboard({ ...shareDash, sharedWith, visibility });
            refresh();
          }}
        />
      ) : null}
    </div>
  );
}
